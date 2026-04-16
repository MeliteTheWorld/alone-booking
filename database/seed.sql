INSERT INTO users (name, email, password_hash, role)
VALUES
  (
    'Администратор',
    'admin@smartbooking.local',
    'e9560da8afa38e92a323ee777fb96826:3ea695d3d4943799d443199dd84e0f3e54ceeb542cdbcf6d78c6b59840706d9a5ed795e088aa23bf812ed40b2a68c83ce64a79b073bf11bb59663899ab51ed1c',
    'admin'
  ),
  (
    'Тестовый клиент',
    'client@smartbooking.local',
    'c9a7944aa40dda322518ad4dc94fe054:dfafb4e2f372ab5ae100a018529915af2ae90c22b1b0694755fb77c9036d544dabf5165bc8bb3411ab8adbfd4a06ef77be00b0427bea4a12c9650a6e8d2dc7b5',
    'client'
  )
ON CONFLICT (email) DO NOTHING;

INSERT INTO services (name, description, duration, price)
VALUES
  ('Женская стрижка', 'Стрижка с укладкой и консультацией мастера.', 60, 2200),
  ('Мужская стрижка', 'Классическая или современная стрижка.', 45, 1500),
  ('Маникюр', 'Маникюр с покрытием и уходом.', 90, 2400),
  ('Консультация косметолога', 'Первичный прием и подбор процедур.', 30, 1800)
ON CONFLICT DO NOTHING;

INSERT INTO business_hours (day_of_week, start_time, end_time, is_working)
VALUES
  (0, '10:00', '16:00', false),
  (1, '09:00', '19:00', true),
  (2, '09:00', '19:00', true),
  (3, '09:00', '19:00', true),
  (4, '09:00', '19:00', true),
  (5, '09:00', '19:00', true),
  (6, '10:00', '16:00', true)
ON CONFLICT (day_of_week) DO UPDATE
SET
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time,
  is_working = EXCLUDED.is_working;
