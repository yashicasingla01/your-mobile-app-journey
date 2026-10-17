CREATE TABLE public.daily_logs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 log_date date NOT NULL, time_zone text NOT NULL,
 sleep_hours numeric NOT NULL, sleep_quality integer NOT NULL, water_glasses integer NOT NULL,
 steps integer NOT NULL, exercise_minutes integer NOT NULL, meals text NOT NULL,
 sugar_junk boolean NOT NULL, stress_level integer NOT NULL, mood integer NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (user_id, log_date)
);
GRANT SELECT, INSERT, UPDATE ON public.daily_logs TO authenticated;
GRANT ALL ON public.daily_logs TO service_role;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_logs_read_own ON public.daily_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY daily_logs_create_today ON public.daily_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND log_date = (now() AT TIME ZONE time_zone)::date);
CREATE POLICY daily_logs_edit_today ON public.daily_logs FOR UPDATE TO authenticated USING (auth.uid() = user_id AND log_date = (now() AT TIME ZONE time_zone)::date) WITH CHECK (auth.uid() = user_id AND log_date = (now() AT TIME ZONE time_zone)::date);
CREATE FUNCTION public.validate_myvita_daily_log() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_timezone_names WHERE name = NEW.time_zone) THEN RAISE EXCEPTION 'Invalid time zone'; END IF;
 IF NEW.log_date <> (now() AT TIME ZONE NEW.time_zone)::date THEN RAISE EXCEPTION 'Only today can be logged or edited'; END IF;
 IF TG_OP = 'UPDATE' THEN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.log_date IS DISTINCT FROM OLD.log_date OR NEW.time_zone IS DISTINCT FROM OLD.time_zone THEN RAISE EXCEPTION 'Log owner, date and time zone cannot change'; END IF;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.user_id AND onboarding_completed AND consent_accepted) THEN RAISE EXCEPTION 'Complete your profile and consent first'; END IF;
 IF NEW.sleep_hours NOT BETWEEN 0 AND 12 OR NEW.sleep_quality NOT BETWEEN 1 AND 5 OR NEW.water_glasses NOT BETWEEN 0 AND 100 OR NEW.steps NOT BETWEEN 0 AND 200000 OR NEW.exercise_minutes NOT BETWEEN 0 AND 1440 OR NEW.meals NOT IN ('light','normal','heavy') OR NEW.stress_level NOT BETWEEN 1 AND 5 OR NEW.mood NOT BETWEEN 1 AND 5 THEN RAISE EXCEPTION 'Invalid daily check-in values'; END IF;
 NEW.updated_at := now();
 RETURN NEW;
END; $$;
CREATE TRIGGER validate_myvita_daily_log BEFORE INSERT OR UPDATE ON public.daily_logs FOR EACH ROW EXECUTE FUNCTION public.validate_myvita_daily_log();