CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  form_type text NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  company text,
  object_type text,
  service text,
  comment text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_page text,
  status text NOT NULL DEFAULT 'new',
  CONSTRAINT leads_name_len CHECK (char_length(name) BETWEEN 1 AND 100),
  CONSTRAINT leads_phone_len CHECK (char_length(phone) BETWEEN 5 AND 30),
  CONSTRAINT leads_comment_len CHECK (comment IS NULL OR char_length(comment) <= 2000),
  CONSTRAINT leads_form_type CHECK (form_type IN ('general','business','home','calculator_home','calculator_business','maintenance'))
);
GRANT INSERT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'new');