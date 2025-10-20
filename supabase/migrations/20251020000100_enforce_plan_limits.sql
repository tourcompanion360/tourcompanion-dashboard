-- Enforce subscription plan limits at the database layer
-- Basic: max 1 client, 1 project, 0 chatbots
-- Pro: unlimited clients/projects, 5 chatbots

-- Helper: resolve plan limits by plan name
CREATE OR REPLACE FUNCTION public.get_plan_limits(p_plan text)
RETURNS TABLE(max_clients int, max_projects int, max_chatbots int)
LANGUAGE sql
AS $$
  SELECT
    CASE WHEN lower(p_plan) = 'basic' THEN 1
         WHEN lower(p_plan) = 'pro' THEN -1
         ELSE 0 END AS max_clients,
    CASE WHEN lower(p_plan) = 'basic' THEN 1
         WHEN lower(p_plan) = 'pro' THEN -1
         ELSE 0 END AS max_projects,
    CASE WHEN lower(p_plan) = 'basic' THEN 0
         WHEN lower(p_plan) = 'pro' THEN 5
         ELSE 0 END AS max_chatbots;
$$;

-- Helper: resolve limits for a creator id
CREATE OR REPLACE FUNCTION public.get_creator_limits(p_creator_id uuid)
RETURNS TABLE(max_clients int, max_projects int, max_chatbots int)
LANGUAGE sql
AS $$
  SELECT * FROM public.get_plan_limits(
    (SELECT COALESCE(subscription_plan, 'basic') FROM public.creators WHERE id = p_creator_id)
  );
$$;

-- Trigger: enforce client limit on end_clients insert
CREATE OR REPLACE FUNCTION public.enforce_end_clients_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  lim RECORD;
  current_count int;
BEGIN
  SELECT * INTO lim FROM public.get_creator_limits(NEW.creator_id);

  IF lim.max_clients IS NULL THEN
    RETURN NEW;
  END IF;

  IF lim.max_clients = -1 THEN
    RETURN NEW; -- unlimited
  END IF;

  SELECT COUNT(*) INTO current_count
  FROM public.end_clients ec
  WHERE ec.creator_id = NEW.creator_id;

  IF current_count >= lim.max_clients THEN
    RAISE EXCEPTION 'Client limit reached for your plan. Upgrade to add more clients.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_end_clients_limit ON public.end_clients;
CREATE TRIGGER trg_enforce_end_clients_limit
BEFORE INSERT ON public.end_clients
FOR EACH ROW
EXECUTE FUNCTION public.enforce_end_clients_limit();

-- Trigger: enforce project limit on projects insert
CREATE OR REPLACE FUNCTION public.enforce_projects_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_creator_id uuid;
  lim RECORD;
  current_count int;
BEGIN
  SELECT ec.creator_id INTO v_creator_id FROM public.end_clients ec WHERE ec.id = NEW.end_client_id;
  IF v_creator_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO lim FROM public.get_creator_limits(v_creator_id);

  IF lim.max_projects = -1 THEN
    RETURN NEW; -- unlimited
  END IF;

  SELECT COUNT(p.id) INTO current_count
  FROM public.projects p
  JOIN public.end_clients ec ON ec.id = p.end_client_id
  WHERE ec.creator_id = v_creator_id;

  IF current_count >= lim.max_projects THEN
    RAISE EXCEPTION 'Project limit reached for your plan. Upgrade to create more projects.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_projects_limit ON public.projects;
CREATE TRIGGER trg_enforce_projects_limit
BEFORE INSERT ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.enforce_projects_limit();

-- Trigger: enforce chatbot limit on chatbots insert
CREATE OR REPLACE FUNCTION public.enforce_chatbots_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_creator_id uuid;
  lim RECORD;
  current_count int;
BEGIN
  SELECT ec.creator_id INTO v_creator_id
  FROM public.projects p
  JOIN public.end_clients ec ON ec.id = p.end_client_id
  WHERE p.id = NEW.project_id;

  IF v_creator_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO lim FROM public.get_creator_limits(v_creator_id);

  IF lim.max_chatbots = -1 THEN
    RETURN NEW; -- unlimited
  END IF;

  SELECT COUNT(cb.id) INTO current_count
  FROM public.chatbots cb
  JOIN public.projects p ON p.id = cb.project_id
  JOIN public.end_clients ec ON ec.id = p.end_client_id
  WHERE ec.creator_id = v_creator_id;

  IF current_count >= lim.max_chatbots THEN
    RAISE EXCEPTION 'Chatbot limit reached for your plan. Upgrade to create more chatbots.'
      USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_chatbots_limit ON public.chatbots;
CREATE TRIGGER trg_enforce_chatbots_limit
BEFORE INSERT ON public.chatbots
FOR EACH ROW
EXECUTE FUNCTION public.enforce_chatbots_limit();


