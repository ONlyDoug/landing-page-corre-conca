-- Inserção do lote único com 70 vagas a 49,90
INSERT INTO public.lots (id, name, price, total_spots, available_spots, is_active)
VALUES (
  '1',
  'Lote Atual',
  49.90,
  70,
  70,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  total_spots = EXCLUDED.total_spots,
  available_spots = EXCLUDED.available_spots,
  is_active = EXCLUDED.is_active;
