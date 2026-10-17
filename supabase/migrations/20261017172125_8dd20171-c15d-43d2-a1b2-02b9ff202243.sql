CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 name text, age integer, gender text, height_cm numeric, weight_kg numeric,
 diet_type text, activity_level text,
 existing_conditions text[] NOT NULL DEFAULT '{}', family_history text[] NOT NULL DEFAULT '{}',
 consent_accepted boolean NOT NULL DEFAULT false, consent_at timestamptz,
 onboarding_completed boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY profiles_create_own ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_delete_own ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);
CREATE FUNCTION public.validate_myvita_profile() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 NEW.updated_at := now();
 IF NEW.consent_accepted THEN
  IF TG_OP = 'INSERT' THEN NEW.consent_at := now();
  ELSIF NOT OLD.consent_accepted THEN NEW.consent_at := now();
  ELSE NEW.consent_at := OLD.consent_at; END IF;
 ELSE NEW.consent_at := NULL; END IF;
 IF NEW.onboarding_completed THEN
  IF NOT NEW.consent_accepted THEN RAISE EXCEPTION 'Consent is required'; END IF;
  IF NEW.name IS NULL OR length(trim(NEW.name)) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Valid name is required'; END IF;
  IF NEW.age IS NULL OR NEW.age NOT BETWEEN 1 AND 120 THEN RAISE EXCEPTION 'Age must be between 1 and 120'; END IF;
  IF NEW.gender IS NULL OR NEW.gender NOT IN ('female','male','other','prefer-not-to-say') THEN RAISE EXCEPTION 'Invalid gender'; END IF;
  IF NEW.height_cm IS NULL OR NEW.height_cm NOT BETWEEN 50 AND 250 THEN RAISE EXCEPTION 'Height must be between 50 and 250 cm'; END IF;
  IF NEW.weight_kg IS NULL OR NEW.weight_kg NOT BETWEEN 10 AND 400 THEN RAISE EXCEPTION 'Weight must be between 10 and 400 kg'; END IF;
  IF NEW.diet_type IS NULL OR NEW.diet_type NOT IN ('veg','non-veg','vegan') THEN RAISE EXCEPTION 'Invalid diet'; END IF;
  IF NEW.activity_level IS NULL OR NEW.activity_level NOT IN ('sedentary','light','moderate','active') THEN RAISE EXCEPTION 'Invalid activity level'; END IF;
 END IF;
 IF NOT NEW.existing_conditions <@ ARRAY['diabetes','hypertension','asthma','thyroid','none']::text[] THEN RAISE EXCEPTION 'Invalid existing conditions'; END IF;
 IF 'none' = ANY(NEW.existing_conditions) AND cardinality(NEW.existing_conditions) > 1 THEN RAISE EXCEPTION 'None cannot be combined with conditions'; END IF;
 IF NOT NEW.family_history <@ ARRAY['diabetes','heart disease','hypertension']::text[] THEN RAISE EXCEPTION 'Invalid family history'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER validate_myvita_profile BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.validate_myvita_profile();
CREATE FUNCTION public.create_myvita_profile() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
 RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.create_myvita_profile() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER create_myvita_profile_on_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_myvita_profile();
INSERT INTO public.profiles (id) SELECT id FROM auth.users ON CONFLICT (id) DO NOTHING;