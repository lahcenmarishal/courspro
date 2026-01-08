CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'teacher',
    'student',
    'parent'
);


--
-- Name: subscription_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_status AS ENUM (
    'active',
    'expired',
    'suspended',
    'cancelled'
);


--
-- Name: subscription_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.subscription_type AS ENUM (
    'monthly',
    'annual'
);


--
-- Name: calculate_reading_time(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calculate_reading_time(content text) RETURNS integer
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
DECLARE
  word_count INTEGER;
BEGIN
  word_count := array_length(regexp_split_to_array(content, '\s+'), 1);
  RETURN GREATEST(1, CEIL(word_count::DECIMAL / 200));
END;
$$;


--
-- Name: generate_slug(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_slug(title text) RETURNS text
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$;


--
-- Name: get_user_role(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_role(_user_id uuid) RETURNS public.app_role
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_blog_post_metadata(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_blog_post_metadata() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  NEW.reading_time_minutes = public.calculate_reading_time(NEW.content);
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: attendances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attendances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    student_id uuid NOT NULL,
    is_present boolean DEFAULT false NOT NULL,
    joined_at timestamp with time zone,
    left_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: blog_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: blog_files; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_files (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_type text NOT NULL,
    file_size integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL,
    featured_image_url text,
    gallery_images text[] DEFAULT '{}'::text[],
    author_id uuid NOT NULL,
    category_id uuid,
    tags text[] DEFAULT '{}'::text[],
    status text DEFAULT 'draft'::text NOT NULL,
    published_at timestamp with time zone,
    scheduled_at timestamp with time zone,
    meta_title text,
    meta_description text,
    og_image_url text,
    reading_time_minutes integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT blog_posts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text])))
);


--
-- Name: classes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.classes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    level_id uuid NOT NULL,
    stream_id uuid,
    school_year_id uuid NOT NULL,
    capacity integer DEFAULT 30 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: grades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grades (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    class_id uuid NOT NULL,
    school_year_id uuid NOT NULL,
    grade_type text DEFAULT 'exam'::text NOT NULL,
    score numeric NOT NULL,
    max_score numeric DEFAULT 20 NOT NULL,
    coefficient numeric DEFAULT 1 NOT NULL,
    comment text,
    graded_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: homework; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homework (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    due_date timestamp with time zone NOT NULL,
    subject_id uuid,
    class_id uuid,
    teacher_id uuid NOT NULL,
    max_score numeric DEFAULT 20,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: homework_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.homework_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    homework_id uuid NOT NULL,
    student_id uuid NOT NULL,
    file_url text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    score numeric,
    feedback text,
    graded_at timestamp with time zone
);


--
-- Name: levels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.levels (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid NOT NULL,
    recipient_id uuid NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    parent_message_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: parent_student; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.parent_student (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid NOT NULL,
    student_id uuid NOT NULL,
    relationship text DEFAULT 'parent'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text NOT NULL,
    phone text,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    bio text,
    specialization text,
    certificates_url text,
    address text,
    city text,
    diploma text,
    years_experience integer DEFAULT 0
);


--
-- Name: resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.resources (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    file_url text,
    file_type text,
    subject_id uuid,
    class_id uuid,
    teacher_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schedule_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schedule_slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assignment_id uuid NOT NULL,
    day_of_week integer NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL,
    room text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT schedule_slots_day_of_week_check CHECK (((day_of_week >= 1) AND (day_of_week <= 7)))
);


--
-- Name: school_years; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_years (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    schedule_slot_id uuid NOT NULL,
    session_date date NOT NULL,
    google_meet_link text,
    status text DEFAULT 'scheduled'::text NOT NULL,
    recording_url text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sessions_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])))
);


--
-- Name: streams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.streams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    level_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: student_enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    class_id uuid NOT NULL,
    school_year_id uuid NOT NULL,
    enrolled_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: subjects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subjects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    coefficient numeric(3,1) DEFAULT 1.0 NOT NULL,
    color text DEFAULT '#3B82F6'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    type public.subscription_type NOT NULL,
    status public.subscription_status DEFAULT 'active'::public.subscription_status NOT NULL,
    price_paid numeric(10,2) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    auto_renew boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: teacher_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teacher_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    teacher_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    class_id uuid NOT NULL,
    school_year_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'approved'::text NOT NULL,
    CONSTRAINT user_roles_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])))
);


--
-- Name: attendances attendances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_name_key UNIQUE (name);


--
-- Name: blog_categories blog_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_pkey PRIMARY KEY (id);


--
-- Name: blog_categories blog_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_categories
    ADD CONSTRAINT blog_categories_slug_key UNIQUE (slug);


--
-- Name: blog_files blog_files_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_files
    ADD CONSTRAINT blog_files_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: classes classes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_pkey PRIMARY KEY (id);


--
-- Name: grades grades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_pkey PRIMARY KEY (id);


--
-- Name: homework homework_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework
    ADD CONSTRAINT homework_pkey PRIMARY KEY (id);


--
-- Name: homework_submissions homework_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_pkey PRIMARY KEY (id);


--
-- Name: levels levels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.levels
    ADD CONSTRAINT levels_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: parent_student parent_student_parent_id_student_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_student
    ADD CONSTRAINT parent_student_parent_id_student_id_key UNIQUE (parent_id, student_id);


--
-- Name: parent_student parent_student_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.parent_student
    ADD CONSTRAINT parent_student_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: schedule_slots schedule_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_slots
    ADD CONSTRAINT schedule_slots_pkey PRIMARY KEY (id);


--
-- Name: school_years school_years_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_years
    ADD CONSTRAINT school_years_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: streams streams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streams
    ADD CONSTRAINT streams_pkey PRIMARY KEY (id);


--
-- Name: student_enrollments student_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_enrollments
    ADD CONSTRAINT student_enrollments_pkey PRIMARY KEY (id);


--
-- Name: student_enrollments student_enrollments_student_id_class_id_school_year_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_enrollments
    ADD CONSTRAINT student_enrollments_student_id_class_id_school_year_id_key UNIQUE (student_id, class_id, school_year_id);


--
-- Name: subjects subjects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subjects
    ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: teacher_assignments teacher_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_pkey PRIMARY KEY (id);


--
-- Name: teacher_assignments teacher_assignments_teacher_id_subject_id_class_id_school_y_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_teacher_id_subject_id_class_id_school_y_key UNIQUE (teacher_id, subject_id, class_id, school_year_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);


--
-- Name: idx_user_roles_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_status ON public.user_roles USING btree (status);


--
-- Name: blog_posts insert_blog_post_metadata_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER insert_blog_post_metadata_trigger BEFORE INSERT ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_blog_post_metadata();


--
-- Name: blog_posts update_blog_post_metadata_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blog_post_metadata_trigger BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_blog_post_metadata();


--
-- Name: homework update_homework_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_homework_updated_at BEFORE UPDATE ON public.homework FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: resources update_resources_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sessions update_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscriptions update_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: attendances attendances_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attendances
    ADD CONSTRAINT attendances_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: blog_files blog_files_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_files
    ADD CONSTRAINT blog_files_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.blog_posts(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: blog_posts blog_posts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.blog_categories(id) ON DELETE SET NULL;


--
-- Name: classes classes_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE CASCADE;


--
-- Name: classes classes_school_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_school_year_id_fkey FOREIGN KEY (school_year_id) REFERENCES public.school_years(id) ON DELETE CASCADE;


--
-- Name: classes classes_stream_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.classes
    ADD CONSTRAINT classes_stream_id_fkey FOREIGN KEY (stream_id) REFERENCES public.streams(id) ON DELETE SET NULL;


--
-- Name: grades grades_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: grades grades_school_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_school_year_id_fkey FOREIGN KEY (school_year_id) REFERENCES public.school_years(id) ON DELETE CASCADE;


--
-- Name: grades grades_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grades
    ADD CONSTRAINT grades_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: homework homework_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework
    ADD CONSTRAINT homework_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: homework homework_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework
    ADD CONSTRAINT homework_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: homework_submissions homework_submissions_homework_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.homework_submissions
    ADD CONSTRAINT homework_submissions_homework_id_fkey FOREIGN KEY (homework_id) REFERENCES public.homework(id) ON DELETE CASCADE;


--
-- Name: messages messages_parent_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_parent_message_id_fkey FOREIGN KEY (parent_message_id) REFERENCES public.messages(id) ON DELETE SET NULL;


--
-- Name: resources resources_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: resources resources_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: schedule_slots schedule_slots_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schedule_slots
    ADD CONSTRAINT schedule_slots_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.teacher_assignments(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_schedule_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_schedule_slot_id_fkey FOREIGN KEY (schedule_slot_id) REFERENCES public.schedule_slots(id) ON DELETE CASCADE;


--
-- Name: streams streams_level_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.streams
    ADD CONSTRAINT streams_level_id_fkey FOREIGN KEY (level_id) REFERENCES public.levels(id) ON DELETE CASCADE;


--
-- Name: student_enrollments student_enrollments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_enrollments
    ADD CONSTRAINT student_enrollments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: student_enrollments student_enrollments_school_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_enrollments
    ADD CONSTRAINT student_enrollments_school_year_id_fkey FOREIGN KEY (school_year_id) REFERENCES public.school_years(id) ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_class_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_school_year_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_school_year_id_fkey FOREIGN KEY (school_year_id) REFERENCES public.school_years(id) ON DELETE CASCADE;


--
-- Name: teacher_assignments teacher_assignments_subject_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teacher_assignments
    ADD CONSTRAINT teacher_assignments_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;


--
-- Name: user_roles Admins can delete roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: attendances Admins can manage all attendances; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all attendances" ON public.attendances USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: grades Admins can manage all grades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all grades" ON public.grades USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: homework Admins can manage all homework; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all homework" ON public.homework USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: messages Admins can manage all messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all messages" ON public.messages USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can manage all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all profiles" ON public.profiles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: resources Admins can manage all resources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all resources" ON public.resources USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can manage all roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all roles" ON public.user_roles USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: homework_submissions Admins can manage all submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all submissions" ON public.homework_submissions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: teacher_assignments Admins can manage assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage assignments" ON public.teacher_assignments USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: blog_categories Admins can manage categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage categories" ON public.blog_categories USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: classes Admins can manage classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage classes" ON public.classes USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: student_enrollments Admins can manage enrollments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage enrollments" ON public.student_enrollments USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: blog_files Admins can manage files; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage files" ON public.blog_files USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: levels Admins can manage levels; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage levels" ON public.levels USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: parent_student Admins can manage parent-student relations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage parent-student relations" ON public.parent_student USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: blog_posts Admins can manage posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage posts" ON public.blog_posts USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: schedule_slots Admins can manage schedule; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage schedule" ON public.schedule_slots USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: school_years Admins can manage school years; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage school years" ON public.school_years USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: sessions Admins can manage sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage sessions" ON public.sessions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: streams Admins can manage streams; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage streams" ON public.streams USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: subjects Admins can manage subjects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage subjects" ON public.subjects USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: subscriptions Admins can manage subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can update roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update roles" ON public.user_roles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: blog_posts Admins can view all posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all posts" ON public.blog_posts FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Admins can view all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: profiles Anyone can view approved teacher profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view approved teacher profiles" ON public.profiles FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = profiles.user_id) AND (user_roles.role = 'teacher'::public.app_role) AND (user_roles.status = 'approved'::text)))));


--
-- Name: user_roles Anyone can view approved teacher roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view approved teacher roles" ON public.user_roles FOR SELECT USING (((role = 'teacher'::public.app_role) AND (status = 'approved'::text)));


--
-- Name: blog_categories Anyone can view categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view categories" ON public.blog_categories FOR SELECT USING (true);


--
-- Name: blog_files Anyone can view files of published posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view files of published posts" ON public.blog_files FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.blog_posts bp
  WHERE ((bp.id = blog_files.post_id) AND (bp.status = 'published'::text) AND ((bp.published_at IS NULL) OR (bp.published_at <= now()))))));


--
-- Name: blog_posts Anyone can view published posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view published posts" ON public.blog_posts FOR SELECT USING (((status = 'published'::text) AND ((published_at IS NULL) OR (published_at <= now()))));


--
-- Name: teacher_assignments Authenticated users can view assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view assignments" ON public.teacher_assignments FOR SELECT TO authenticated USING (true);


--
-- Name: classes Authenticated users can view classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view classes" ON public.classes FOR SELECT TO authenticated USING (true);


--
-- Name: levels Authenticated users can view levels; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view levels" ON public.levels FOR SELECT TO authenticated USING (true);


--
-- Name: schedule_slots Authenticated users can view schedule; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view schedule" ON public.schedule_slots FOR SELECT TO authenticated USING (true);


--
-- Name: school_years Authenticated users can view school years; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view school years" ON public.school_years FOR SELECT TO authenticated USING (true);


--
-- Name: sessions Authenticated users can view sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view sessions" ON public.sessions FOR SELECT TO authenticated USING (true);


--
-- Name: streams Authenticated users can view streams; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view streams" ON public.streams FOR SELECT TO authenticated USING (true);


--
-- Name: subjects Authenticated users can view subjects; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view subjects" ON public.subjects FOR SELECT TO authenticated USING (true);


--
-- Name: parent_student Parents can view their children; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can view their children" ON public.parent_student FOR SELECT USING ((parent_id = auth.uid()));


--
-- Name: grades Parents can view their children grades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Parents can view their children grades" ON public.grades FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.parent_student ps
  WHERE ((ps.parent_id = auth.uid()) AND (ps.student_id = grades.student_id)))));


--
-- Name: homework_submissions Students can manage their submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can manage their submissions" ON public.homework_submissions USING ((student_id = auth.uid()));


--
-- Name: homework Students can view homework for their classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view homework for their classes" ON public.homework FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.student_enrollments se
  WHERE ((se.student_id = auth.uid()) AND (se.class_id = homework.class_id)))));


--
-- Name: resources Students can view resources for their classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view resources for their classes" ON public.resources FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.student_enrollments se
  WHERE ((se.student_id = auth.uid()) AND (se.class_id = resources.class_id)))));


--
-- Name: attendances Students can view their attendance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view their attendance" ON public.attendances FOR SELECT USING ((student_id = auth.uid()));


--
-- Name: student_enrollments Students can view their enrollments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view their enrollments" ON public.student_enrollments FOR SELECT USING ((student_id = auth.uid()));


--
-- Name: grades Students can view their grades; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view their grades" ON public.grades FOR SELECT USING ((student_id = auth.uid()));


--
-- Name: parent_student Students can view their parents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view their parents" ON public.parent_student FOR SELECT USING ((student_id = auth.uid()));


--
-- Name: subscriptions Students can view their subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Students can view their subscriptions" ON public.subscriptions FOR SELECT USING ((student_id = auth.uid()));


--
-- Name: attendances Teachers can manage attendance for their sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can manage attendance for their sessions" ON public.attendances USING ((EXISTS ( SELECT 1
   FROM ((public.sessions s
     JOIN public.schedule_slots ss ON ((s.schedule_slot_id = ss.id)))
     JOIN public.teacher_assignments ta ON ((ss.assignment_id = ta.id)))
  WHERE ((s.id = attendances.session_id) AND (ta.teacher_id = auth.uid())))));


--
-- Name: grades Teachers can manage grades for their classes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can manage grades for their classes" ON public.grades USING ((EXISTS ( SELECT 1
   FROM public.teacher_assignments ta
  WHERE ((ta.teacher_id = auth.uid()) AND (ta.class_id = grades.class_id) AND (ta.subject_id = grades.subject_id)))));


--
-- Name: homework Teachers can manage their homework; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can manage their homework" ON public.homework USING ((teacher_id = auth.uid()));


--
-- Name: resources Teachers can manage their resources; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can manage their resources" ON public.resources USING ((teacher_id = auth.uid()));


--
-- Name: sessions Teachers can update their sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can update their sessions" ON public.sessions FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM (public.schedule_slots ss
     JOIN public.teacher_assignments ta ON ((ss.assignment_id = ta.id)))
  WHERE ((ss.id = sessions.schedule_slot_id) AND (ta.teacher_id = auth.uid())))));


--
-- Name: homework_submissions Teachers can view and grade submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can view and grade submissions" ON public.homework_submissions USING ((EXISTS ( SELECT 1
   FROM public.homework h
  WHERE ((h.id = homework_submissions.homework_id) AND (h.teacher_id = auth.uid())))));


--
-- Name: teacher_assignments Teachers can view their assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can view their assignments" ON public.teacher_assignments FOR SELECT USING ((teacher_id IN ( SELECT profiles.user_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: student_enrollments Teachers can view their class enrollments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Teachers can view their class enrollments" ON public.student_enrollments FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.teacher_assignments ta
  WHERE ((ta.class_id = ta.class_id) AND (ta.teacher_id = auth.uid())))));


--
-- Name: user_roles Users can insert their own pending role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own pending role" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (((auth.uid() = user_id) AND (status = 'pending'::text) AND (role = ANY (ARRAY['teacher'::public.app_role, 'student'::public.app_role, 'parent'::public.app_role]))));


--
-- Name: messages Users can send messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK ((sender_id = auth.uid()));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: messages Users can update their received messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their received messages" ON public.messages FOR UPDATE USING ((recipient_id = auth.uid()));


--
-- Name: messages Users can view their messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (((sender_id = auth.uid()) OR (recipient_id = auth.uid())));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: attendances; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_files; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_files ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: classes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

--
-- Name: grades; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;

--
-- Name: homework; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;

--
-- Name: homework_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.homework_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: levels; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: parent_student; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.parent_student ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: resources; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

--
-- Name: schedule_slots; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;

--
-- Name: school_years; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.school_years ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: streams; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.streams ENABLE ROW LEVEL SECURITY;

--
-- Name: student_enrollments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

--
-- Name: subjects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: teacher_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;