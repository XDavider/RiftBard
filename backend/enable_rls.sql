-- Activa Row-Level Security en todas las tablas públicas.
-- Sin políticas, la API REST pública de Supabase (anon/authenticated) no puede acceder.
-- El backend usa la conexión directa de Postgres (rol postgres) y no se ve afectado.
ALTER TABLE public.cards            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deck_cards       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_collection  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_manual_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wishlist    ENABLE ROW LEVEL SECURITY;

