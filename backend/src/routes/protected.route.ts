import { Router } from "express";
const router = Router();

router.get("/service/:id", async (req, res) => {
  const serviceId = req.params.id;

  const service = {
    id: serviceId,
    name: "Servicio Premium",
    price: "$0.01",
  };

  res.json({ service });
});

export default router;
