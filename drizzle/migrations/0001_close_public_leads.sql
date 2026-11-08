-- Релиз 1: публичный приём заявок отключён (ТЗ, раздел 5). Данные не удаляются.
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
REVOKE INSERT ON public.leads FROM anon, authenticated;
