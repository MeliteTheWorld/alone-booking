INSERT INTO users (name, email, password_hash, role)
VALUES
  (
    'Администратор',
    'admin@alone.local',
    '1cc787c0ed8e4040b1eb09ed0537b1bb:07d8cddaed0950d47003ec8759b698e886ccaec650e60aca9ab630758669fea0ffa5b8bea53ea850ce6d732f666af4aa44c271261f5ea9ca555c8a7b553c0264',
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
