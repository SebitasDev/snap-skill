export const isEvmAddress = (address: string): boolean => {
  if (typeof address !== "string") {
    return false;
  }

  const evmAddressRegex = /^0x[a-fA-F0-9]{40}$/;

  return evmAddressRegex.test(address);
};
