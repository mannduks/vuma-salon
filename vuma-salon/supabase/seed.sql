do $$
declare
  salon_uuid uuid := '6d408ee7-9ba8-44f7-b749-3a4c7c36767d';
  owner_uuid uuid := '11111111-1111-1111-1111-111111111111';
begin
  insert into public.salons (
    id,
    name,
    slug,
    business_type,
    city,
    province
  )
  values (
    salon_uuid,
    'VUMA Salon Braam',
    'vuma-braam',
    'hybrid',
    'Johannesburg',
    'Gauteng'
  )
  on conflict (id) do nothing;

  insert into public.profiles (id, salon_id, full_name, role)
  select owner_uuid, salon_uuid, 'Nandi Mokoena', 'owner'
  where exists (select 1 from auth.users where id = owner_uuid)
  on conflict (id) do nothing;

  insert into public.salon_settings (salon_id, owner_name, phone_number, opening_hours)
  values (
    salon_uuid,
    'Nandi Mokoena',
    '+27 82 900 1100',
    '[
      {"day":"Monday","isOpen":true,"openTime":"08:00","closeTime":"18:00"},
      {"day":"Tuesday","isOpen":true,"openTime":"08:00","closeTime":"18:00"},
      {"day":"Wednesday","isOpen":true,"openTime":"08:00","closeTime":"18:00"},
      {"day":"Thursday","isOpen":true,"openTime":"08:00","closeTime":"18:00"},
      {"day":"Friday","isOpen":true,"openTime":"08:00","closeTime":"19:00"},
      {"day":"Saturday","isOpen":true,"openTime":"08:00","closeTime":"17:00"},
      {"day":"Sunday","isOpen":false,"openTime":"09:00","closeTime":"14:00"}
    ]'::jsonb
  )
  on conflict (salon_id) do update
  set owner_name = excluded.owner_name,
      phone_number = excluded.phone_number,
      opening_hours = excluded.opening_hours;

  insert into public.customers (
    id,
    salon_id,
    full_name,
    phone_number,
    email,
    notes,
    loyalty_points,
    created_at
  )
  values
    ('21d70547-5985-4a8b-b28d-4846df50d1e5', salon_uuid, 'Ayanda Mthembu', '+27 82 114 2098', 'ayanda@example.com', 'Prefers Friday evening touch-ups.', 120, '2026-05-01 08:00:00+02'),
    ('de25ccb0-0c99-4c44-a250-3b35ba0f1ac5', salon_uuid, 'Karabo Dlamini', '+27 71 566 1240', 'karabo@example.com', 'Books beard grooming before content shoots.', 78, '2026-05-01 08:00:00+02'),
    ('a5b88a04-8dd7-47d7-9271-474143e67658', salon_uuid, 'Zanele Sithole', '+27 83 441 0023', 'zanele@example.com', 'First-time colour client.', 22, '2026-05-01 08:00:00+02'),
    ('b5e9b90e-e3df-4812-a28a-67f89d19c8e4', salon_uuid, 'Lwazi Ngcobo', '+27 67 845 7781', 'lwazi@example.com', 'Comes in with walk-in referrals from campus.', 65, '2026-05-01 08:00:00+02')
  on conflict (id) do nothing;

  insert into public.staff_members (
    id,
    salon_id,
    full_name,
    role_title,
    mobile,
    email,
    commission_rate,
    status,
    speciality,
    created_at
  )
  values
    ('6747f2b3-55d3-44e1-8094-0a804e8f7698', salon_uuid, 'Busi Khumalo', 'Senior Stylist', '+27 76 441 6631', 'busi@vuma.example', 18, 'active', 'Protective styling and silk press', '2026-05-01 08:00:00+02'),
    ('54b762e5-a575-42c8-b4dc-5221dcf26601', salon_uuid, 'Thato Maseko', 'Barber', '+27 72 881 9301', 'thato@vuma.example', 15, 'active', 'Precision fades and beard shaping', '2026-05-01 08:00:00+02'),
    ('ba57aa83-3d7a-472f-a778-80be07ca6510', salon_uuid, 'Palesa Ndlovu', 'Colour Specialist', '+27 78 120 4519', 'palesa@vuma.example', 20, 'inactive', 'Colour correction and treatments', '2026-05-01 08:00:00+02')
  on conflict (id) do nothing;

  insert into public.services (
    id,
    salon_id,
    name,
    category,
    duration_minutes,
    price_zar,
    is_active,
    description,
    created_at
  )
  values
    ('0db6c324-9bde-4650-a021-a57ecf4aef13', salon_uuid, 'Signature Silk Press', 'Haircare', 90, 650, true, 'Wash, treatment, blowout and silk finish.', '2026-05-01 08:00:00+02'),
    ('43400b91-a895-46cb-b534-f86e6a8274fe', salon_uuid, 'Skin Fade + Beard Lineup', 'Barbering', 60, 240, true, 'Sharp fade, beard clean-up and hot towel finish.', '2026-05-01 08:00:00+02'),
    ('9775aa75-5959-490f-8d2b-173653c91dd2', salon_uuid, 'Knotless Braids', 'Protective Styling', 240, 1300, true, 'Medium knotless install with parting and finish.', '2026-05-01 08:00:00+02'),
    ('974bca33-cdcf-4e94-8f8f-5ee08dc9f238', salon_uuid, 'Colour Refresh', 'Colour', 150, 950, true, 'Root refresh, gloss and bond care.', '2026-05-01 08:00:00+02'),
    ('6f8df3d9-9219-4059-9394-ed14c785dbe4', salon_uuid, 'Scalp Detox', 'Treatments', 45, 220, true, 'Clarifying exfoliation and hydration boost.', '2026-05-01 08:00:00+02')
  on conflict (id) do nothing;

  insert into public.appointments (
    id,
    salon_id,
    customer_id,
    staff_member_id,
    starts_at,
    ends_at,
    status,
    total_amount,
    notes,
    created_at
  )
  values
    ('c12e7037-29bb-4746-96ee-78af06f2ead4', salon_uuid, '21d70547-5985-4a8b-b28d-4846df50d1e5', '6747f2b3-55d3-44e1-8094-0a804e8f7698', '2026-05-27 09:00:00+02', '2026-05-27 10:30:00+02', 'confirmed', 650, 'Arrives before work. Keep silk serum ready.', '2026-05-01 08:00:00+02'),
    ('3ca5abf1-7ab3-4f7d-98c9-3bf2127de6eb', salon_uuid, 'de25ccb0-0c99-4c44-a250-3b35ba0f1ac5', '54b762e5-a575-42c8-b4dc-5221dcf26601', '2026-05-27 11:00:00+02', '2026-05-27 12:00:00+02', 'booked', 240, 'Content shoot later in the day.', '2026-05-01 08:00:00+02'),
    ('2b0d845c-b8e1-4a4a-bbd7-5560b9e99687', salon_uuid, 'a5b88a04-8dd7-47d7-9271-474143e67658', 'ba57aa83-3d7a-472f-a778-80be07ca6510', '2026-05-27 13:30:00+02', '2026-05-27 16:00:00+02', 'booked', 1170, 'Patch test already completed.', '2026-05-01 08:00:00+02'),
    ('9d97d17e-d7ef-48ab-b430-1d9394b7fa77', salon_uuid, 'b5e9b90e-e3df-4812-a28a-67f89d19c8e4', '54b762e5-a575-42c8-b4dc-5221dcf26601', '2026-05-26 17:00:00+02', '2026-05-26 18:00:00+02', 'completed', 240, 'Campus promo redeemed.', '2026-05-01 08:00:00+02')
  on conflict (id) do nothing;

  insert into public.appointment_services (appointment_id, service_id)
  values
    ('c12e7037-29bb-4746-96ee-78af06f2ead4', '0db6c324-9bde-4650-a021-a57ecf4aef13'),
    ('3ca5abf1-7ab3-4f7d-98c9-3bf2127de6eb', '43400b91-a895-46cb-b534-f86e6a8274fe'),
    ('2b0d845c-b8e1-4a4a-bbd7-5560b9e99687', '974bca33-cdcf-4e94-8f8f-5ee08dc9f238'),
    ('2b0d845c-b8e1-4a4a-bbd7-5560b9e99687', '6f8df3d9-9219-4059-9394-ed14c785dbe4'),
    ('9d97d17e-d7ef-48ab-b430-1d9394b7fa77', '43400b91-a895-46cb-b534-f86e6a8274fe')
  on conflict do nothing;

  insert into public.sales (
    id,
    salon_id,
    appointment_id,
    customer_id,
    staff_member_id,
    sale_date,
    subtotal_zar,
    discount_zar,
    total_zar,
    amount_paid_zar,
    payment_status,
    payment_method,
    commission_rate_snapshot,
    commission_amount,
    notes,
    created_at
  )
  values
    ('8cdb9e2e-77ef-4635-aa18-c0b6e0b0b35f', salon_uuid, '9d97d17e-d7ef-48ab-b430-1d9394b7fa77', 'b5e9b90e-e3df-4812-a28a-67f89d19c8e4', '54b762e5-a575-42c8-b4dc-5221dcf26601', '2026-05-26 16:10:00+02', 240, 0, 240, 240, 'paid', 'card', 15, 36, 'Walk-in sale closed at desk.', '2026-05-01 08:00:00+02'),
    ('92d4d8fe-46bf-4f7a-bb61-4652f5f2ea6c', salon_uuid, null, '21d70547-5985-4a8b-b28d-4846df50d1e5', '6747f2b3-55d3-44e1-8094-0a804e8f7698', '2026-05-24 15:45:00+02', 650, 50, 600, 300, 'partial', 'eft', 18, 108, 'Deposit settled, balance due on Friday.', '2026-05-01 08:00:00+02'),
    ('f7856155-e92c-41dd-817f-50f2872118c7', salon_uuid, null, 'a5b88a04-8dd7-47d7-9271-474143e67658', 'ba57aa83-3d7a-472f-a778-80be07ca6510', '2026-05-22 13:20:00+02', 1170, 0, 1170, 1170, 'paid', 'card', 20, 234, 'Colour refresh package.', '2026-05-01 08:00:00+02')
  on conflict (id) do nothing;

  insert into public.sale_services (sale_id, service_id)
  values
    ('8cdb9e2e-77ef-4635-aa18-c0b6e0b0b35f', '43400b91-a895-46cb-b534-f86e6a8274fe'),
    ('92d4d8fe-46bf-4f7a-bb61-4652f5f2ea6c', '0db6c324-9bde-4650-a021-a57ecf4aef13'),
    ('f7856155-e92c-41dd-817f-50f2872118c7', '974bca33-cdcf-4e94-8f8f-5ee08dc9f238'),
    ('f7856155-e92c-41dd-817f-50f2872118c7', '6f8df3d9-9219-4059-9394-ed14c785dbe4')
  on conflict do nothing;
end $$;
