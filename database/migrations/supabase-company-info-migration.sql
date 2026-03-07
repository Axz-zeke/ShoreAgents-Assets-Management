-- Create company_info table
CREATE TABLE IF NOT EXISTS public.company_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company VARCHAR(255) NOT NULL,
  organization_type VARCHAR(255),
  country VARCHAR(255),
  address TEXT,
  apt_suite VARCHAR(255),
  city VARCHAR(255),
  state VARCHAR(255),
  postal_code VARCHAR(50),
  timezone VARCHAR(100),
  currency VARCHAR(10),
  logo_url TEXT,
  created_at TIMESTAMPTZ(6) DEFAULT NOW(),
  updated_at TIMESTAMPTZ(6) DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_company_info_created_at ON public.company_info(created_at);

-- Insert default company info if none exists
INSERT INTO public.company_info (company, organization_type, country, address, city, state, postal_code, timezone, currency)
SELECT 'ShoreAgents Assets Inc.', 'Corporation', 'United States', '123 Business Street', 'New York', 'NY', '10001', 'America/New_York', 'USD'
WHERE NOT EXISTS (SELECT 1 FROM public.company_info);





