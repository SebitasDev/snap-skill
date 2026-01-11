import { createPublicClient, http, parseAbiItem, parseUnits, Address } from "viem";
import { base } from "viem/chains";
import { Purchase } from "../models/purchase.model";
import { Transfer } from "../models/transfer.model";
import { Review } from "../models/review.model";
import { WalletRelationship } from "../models/walletRelationship.model";

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
const CHAIN_ID = 8453; // Base mainnet
const MIN_CONFIRMATIONS = 12n;
const MIN_USDC = parseUnits("10", 6); // $10 minimum
const MAX_BLOCK_RANGE = 100_000n; // ~2 days on Base, prevents huge scans

const client = createPublicClient({
  chain: base,
  transport: http(),
});

interface TransferResult {
  txHash: string;
  amount: string;
  blockNumber: string;
  timestamp: Date;
  reviewed: boolean;
}

interface RefreshResult {
  transfers: TransferResult[];
  hasMore: boolean;
  error?: string;
}

export async function refreshTransfers(
  buyer: string,
  seller: string
): Promise<RefreshResult> {
  const buyerLower = buyer.toLowerCase() as Address;
  const sellerLower = seller.toLowerCase();

  // 1. Get first on-site purchase to determine relationship start
  const firstPurchase = await Purchase.findOne({
    buyerWallet: buyerLower,
    sellerWallet: sellerLower,
  }).sort({ blockNumber: 1 });

  if (!firstPurchase) {
    // No on-site purchase = no relationship = nothing to scan
    return { transfers: [], hasMore: false };
  }

  // 2. Get all on-site purchase txHashes to exclude
  const onSiteTxHashes = await Purchase.find({
    buyerWallet: buyerLower,
    sellerWallet: sellerLower,
  }).distinct("txHash");
  const excludeSet = new Set(onSiteTxHashes.map((h: string) => h.toLowerCase()));

  // 3. Get cursor (or start from first purchase block)
  const relationship = await WalletRelationship.findOne({
    buyerWallet: buyerLower,
    sellerWallet: sellerLower,
    chainId: CHAIN_ID,
  });

  const relationshipStartBlock = BigInt(firstPurchase.blockNumber);
  const lastProcessedBlock = relationship?.lastProcessedBlock
    ? BigInt(relationship.lastProcessedBlock)
    : relationshipStartBlock - 1n;

  // 4. Get latest block (with error handling)
  let latestBlock: bigint;
  try {
    latestBlock = await client.getBlockNumber();
  } catch (err) {
    console.error("Failed to fetch latest block:", err);
    return {
      transfers: await getCachedTransfers(buyerLower, sellerLower),
      hasMore: true,
      error: "Failed to fetch latest block",
    };
  }

  // 5. Calculate scan range (capped, confirmed only)
  const maxConfirmedBlock = latestBlock - MIN_CONFIRMATIONS;
  const fromBlock = lastProcessedBlock + 1n;
  const toBlock =
    fromBlock + MAX_BLOCK_RANGE < maxConfirmedBlock
      ? fromBlock + MAX_BLOCK_RANGE
      : maxConfirmedBlock;

  const hasMore = toBlock < maxConfirmedBlock;

  if (fromBlock > toBlock) {
    // Already up to date
    return {
      transfers: await getCachedTransfers(buyerLower, sellerLower),
      hasMore: false,
    };
  }

  // 6. Query chain logs (with error handling)
  let logs;
  try {
    logs = await client.getLogs({
      address: USDC_ADDRESS,
      event: parseAbiItem(
        "event Transfer(address indexed from, address indexed to, uint256 value)"
      ),
      args: { from: buyerLower, to: sellerLower as Address },
      fromBlock,
      toBlock,
    });
  } catch (err) {
    console.error("Failed to fetch logs:", err);
    return {
      transfers: await getCachedTransfers(buyerLower, sellerLower),
      hasMore: true,
      error: "Failed to fetch latest payments",
    };
  }

  // 7. Filter: above threshold, not an on-site purchase
  const newTransfers = logs.filter(
    (log: { args: { value?: bigint }; blockNumber: bigint | null; transactionHash: string }) =>
      log.args.value !== undefined &&
      log.args.value >= MIN_USDC &&
      log.blockNumber !== null &&
      !excludeSet.has(log.transactionHash.toLowerCase())
  );

  // 8. Fetch timestamps for new transfers (batch by unique blocks)
  const uniqueBlocks = [...new Set(newTransfers.map((t: { blockNumber: bigint | null }) => t.blockNumber!))];
  const blockTimestamps = new Map<bigint, Date>();

  for (const blockNum of uniqueBlocks) {
    try {
      const block = await client.getBlock({ blockNumber: blockNum as bigint });
      blockTimestamps.set(blockNum as bigint, new Date(Number(block.timestamp) * 1000));
    } catch {
      blockTimestamps.set(blockNum as bigint, new Date()); // fallback
    }
  }

  // 9. Bulk upsert new transfers
  if (newTransfers.length > 0) {
    await Transfer.bulkWrite(
      newTransfers.map((log: { transactionHash: string; args: { value?: bigint }; blockNumber: bigint | null }) => ({
        updateOne: {
          filter: {
            chainId: CHAIN_ID,
            txHash: log.transactionHash.toLowerCase(),
          },
          update: {
            $setOnInsert: {
              chainId: CHAIN_ID,
              txHash: log.transactionHash.toLowerCase(),
              buyerWallet: buyerLower,
              sellerWallet: sellerLower,
              amount: log.args.value!.toString(),
              blockNumber: log.blockNumber!.toString(),
              timestamp: blockTimestamps.get(log.blockNumber!) || new Date(),
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      }))
    );
  }

  // 10. Update cursor
  await WalletRelationship.updateOne(
    { buyerWallet: buyerLower, sellerWallet: sellerLower, chainId: CHAIN_ID },
    { $set: { lastProcessedBlock: toBlock.toString() } },
    { upsert: true }
  );

  return {
    transfers: await getCachedTransfers(buyerLower, sellerLower),
    hasMore,
  };
}

async function getCachedTransfers(
  buyer: string,
  seller: string
): Promise<TransferResult[]> {
  const transfers = await Transfer.find({
    buyerWallet: buyer,
    sellerWallet: seller,
    chainId: CHAIN_ID,
  }).sort({ blockNumber: -1 });

  // Get reviewed txHashes (O(1) lookup)
  const reviewedTxHashes = await Review.find({
    reviewerWallet: buyer,
    sellerWallet: seller,
    chainId: CHAIN_ID,
  }).distinct("txHash");
  const reviewedSet = new Set(reviewedTxHashes.map((h: string) => h.toLowerCase()));

  return transfers.map((t: { txHash: string; amount: string; blockNumber: string; timestamp: Date }) => ({
    txHash: t.txHash,
    amount: t.amount,
    blockNumber: t.blockNumber,
    timestamp: t.timestamp,
    reviewed: reviewedSet.has(t.txHash.toLowerCase()),
  }));
}

// Get cached transfers without refreshing (for instant page load)
export async function getCachedTransfersForRelationship(
  buyer: string,
  seller: string
): Promise<RefreshResult> {
  const buyerLower = buyer.toLowerCase();
  const sellerLower = seller.toLowerCase();

  // Check if relationship exists
  const firstPurchase = await Purchase.findOne({
    buyerWallet: buyerLower,
    sellerWallet: sellerLower,
  });

  if (!firstPurchase) {
    return { transfers: [], hasMore: false };
  }

  // Check if we need to scan more
  const relationship = await WalletRelationship.findOne({
    buyerWallet: buyerLower,
    sellerWallet: sellerLower,
    chainId: CHAIN_ID,
  });

  let hasMore = false;
  if (relationship?.lastProcessedBlock) {
    try {
      const latestBlock = await client.getBlockNumber();
      const maxConfirmedBlock = latestBlock - MIN_CONFIRMATIONS;
      hasMore = BigInt(relationship.lastProcessedBlock) < maxConfirmedBlock;
    } catch {
      hasMore = true; // Assume there might be more if we can't check
    }
  } else {
    hasMore = true; // Never scanned before
  }

  return {
    transfers: await getCachedTransfers(buyerLower, sellerLower),
    hasMore,
  };
}

