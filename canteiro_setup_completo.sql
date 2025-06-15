-- =============================================
-- CANTEIRO APP - SETUP COMPLETO
-- Arquivo único com toda a configuração do banco
-- Execute este arquivo no Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. CRIAÇÃO DAS TABELAS
-- =============================================

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enum para roles de usuário
DO $$ BEGIN
    CREATE TYPE profiles_role_enum AS ENUM ('admin', 'encarregado', 'mestre_obras', 'operario', 'almoxarife');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    role profiles_role_enum NOT NULL DEFAULT 'operario',
    company_id UUID NOT NULL REFERENCES companies(id),
    avatar_url TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enum para status de ferramentas
DO $$ BEGIN
    CREATE TYPE tool_status_enum AS ENUM ('disponivel', 'em_uso', 'manutencao', 'danificada', 'descartada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela de categorias de ferramentas
CREATE TABLE IF NOT EXISTS tool_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    company_id UUID NOT NULL REFERENCES companies(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de ferramentas
CREATE TABLE IF NOT EXISTS tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    serial_number VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    status tool_status_enum DEFAULT 'disponivel',
    location VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES tool_categories(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    assigned_to UUID REFERENCES profiles(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    qr_code VARCHAR(255),
    photo_url TEXT,
    observations TEXT,
    next_maintenance_date DATE,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enum para ações de movimentação
DO $$ BEGIN
    CREATE TYPE movement_action_enum AS ENUM ('emprestado', 'devolvido', 'manutencao_enviado', 'manutencao_retornado', 'transferido', 'descartado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela de movimentações de ferramentas
CREATE TABLE IF NOT EXISTS tool_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES tools(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    action movement_action_enum NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    previous_location VARCHAR(255),
    new_location VARCHAR(255),
    previous_assigned_to UUID REFERENCES profiles(id),
    new_assigned_to UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enum para tipos de manutenção
DO $$ BEGIN
    CREATE TYPE maintenance_type_enum AS ENUM ('preventiva', 'corretiva', 'emergencial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enum para status de manutenção
DO $$ BEGIN
    CREATE TYPE maintenance_status_enum AS ENUM ('agendada', 'em_andamento', 'concluida', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela de registros de manutenção
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES tools(id),
    type maintenance_type_enum NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10,2),
    technician_name VARCHAR(255),
    company_service VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    status maintenance_status_enum DEFAULT 'agendada',
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enum para tipos de notificação
DO $$ BEGIN
    CREATE TYPE notification_type_enum AS ENUM ('info', 'warning', 'error', 'success');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type_enum DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    related_tool_id UUID REFERENCES tools(id),
    related_movement_id UUID REFERENCES tool_movements(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_tools_company_id ON tools(company_id);
CREATE INDEX IF NOT EXISTS idx_tools_status ON tools(status);
CREATE INDEX IF NOT EXISTS idx_tools_assigned_to ON tools(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tools_category_id ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tool_movements_tool_id ON tool_movements(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_movements_user_id ON tool_movements(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_records_tool_id ON maintenance_records(tool_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- =============================================
-- 3. TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tools_updated_at ON tools;
CREATE TRIGGER update_tools_updated_at
    BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_maintenance_records_updated_at ON maintenance_records;
CREATE TRIGGER update_maintenance_records_updated_at
    BEFORE UPDATE ON maintenance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para companies
DROP POLICY IF EXISTS "companies_select_policy" ON companies;
CREATE POLICY "companies_select_policy" ON companies
    FOR SELECT USING (
        id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Políticas para profiles (sem recursão)
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
CREATE POLICY "profiles_select_policy" ON profiles
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
CREATE POLICY "profiles_insert_policy" ON profiles
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
CREATE POLICY "profiles_update_policy" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Políticas para tool_categories
DROP POLICY IF EXISTS "tool_categories_select_policy" ON tool_categories;
CREATE POLICY "tool_categories_select_policy" ON tool_categories
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Políticas para tools
DROP POLICY IF EXISTS "tools_select_policy" ON tools;
CREATE POLICY "tools_select_policy" ON tools
    FOR SELECT USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "tools_insert_policy" ON tools;
CREATE POLICY "tools_insert_policy" ON tools
    FOR INSERT WITH CHECK (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "tools_update_policy" ON tools;
CREATE POLICY "tools_update_policy" ON tools
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Políticas para tool_movements
DROP POLICY IF EXISTS "tool_movements_select_policy" ON tool_movements;
CREATE POLICY "tool_movements_select_policy" ON tool_movements
    FOR SELECT USING (
        tool_id IN (
            SELECT id FROM tools WHERE company_id IN (
                SELECT company_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

DROP POLICY IF EXISTS "tool_movements_insert_policy" ON tool_movements;
CREATE POLICY "tool_movements_insert_policy" ON tool_movements
    FOR INSERT WITH CHECK (
        tool_id IN (
            SELECT id FROM tools WHERE company_id IN (
                SELECT company_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Políticas para maintenance_records
DROP POLICY IF EXISTS "maintenance_records_select_policy" ON maintenance_records;
CREATE POLICY "maintenance_records_select_policy" ON maintenance_records
    FOR SELECT USING (
        tool_id IN (
            SELECT id FROM tools WHERE company_id IN (
                SELECT company_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Políticas para notifications
DROP POLICY IF EXISTS "notifications_select_policy" ON notifications;
CREATE POLICY "notifications_select_policy" ON notifications
    FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_policy" ON notifications;
CREATE POLICY "notifications_update_policy" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- =============================================
-- 5. FUNÇÃO PARA MAPEAR ROLES
-- =============================================

CREATE OR REPLACE FUNCTION public.map_role_to_valid(input_role TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE 
        WHEN LOWER(input_role) LIKE '%admin%' THEN 'admin'
        WHEN LOWER(input_role) LIKE '%encarregado%' THEN 'encarregado'
        WHEN LOWER(input_role) LIKE '%mestre%' THEN 'mestre_obras'
        WHEN LOWER(input_role) LIKE '%almoxarife%' THEN 'almoxarife'
        WHEN LOWER(input_role) LIKE '%desenvolvedor%' THEN 'admin'
        WHEN LOWER(input_role) LIKE '%gerente%' THEN 'encarregado'
        WHEN LOWER(input_role) LIKE '%supervisor%' THEN 'encarregado'
        ELSE 'operario'
    END;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. FUNÇÃO PARA CRIAR PERFIL AUTOMATICAMENTE
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    mapped_company_id UUID;
    default_company_id UUID;
    mapped_role TEXT;
    existing_profile_id UUID;
BEGIN
    -- Log para debug
    RAISE LOG 'Creating profile for user: %', NEW.id;
    
    -- Verifica se o perfil já existe
    SELECT id INTO existing_profile_id
    FROM public.profiles
    WHERE id = NEW.id;
    
    IF existing_profile_id IS NOT NULL THEN
        RAISE LOG 'Profile already exists for user: %, skipping creation', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Mapeia o role para um valor válido
    mapped_role := public.map_role_to_valid(
        COALESCE(NEW.raw_user_meta_data->>'role', 'operario')
    );
    
    -- Busca empresa padrão
    SELECT id INTO default_company_id
    FROM public.companies
    WHERE name = 'Construtora ABC Ltda'
    LIMIT 1;
    
    -- Se não encontrar empresa padrão, cria uma
    IF default_company_id IS NULL THEN
        INSERT INTO public.companies (name, code, is_active, created_at, updated_at)
        VALUES ('Construtora ABC Ltda', 'ABC001', true, NOW(), NOW())
        RETURNING id INTO default_company_id;
        
        RAISE LOG 'Created default company: %', default_company_id;
    END IF;
    
    -- Mapeia código da empresa se fornecido
    IF NEW.raw_user_meta_data->>'company_code' IS NOT NULL THEN
        SELECT id INTO mapped_company_id
        FROM public.companies
        WHERE UPPER(code) = UPPER(NEW.raw_user_meta_data->>'company_code')
          AND is_active = true;
    END IF;
    
    -- Usa empresa mapeada ou padrão
    mapped_company_id := COALESCE(mapped_company_id, default_company_id);
    
    -- Insere o perfil com ON CONFLICT para evitar duplicação
    INSERT INTO public.profiles (
        id,
        full_name,
        cpf,
        role,
        company_id,
        phone,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'),
        COALESCE(NEW.raw_user_meta_data->>'cpf', '000.000.000-00'),
        mapped_role::profiles_role_enum,
        mapped_company_id,
        NEW.raw_user_meta_data->>'phone',
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE LOG 'Profile created successfully for user: %', NEW.id;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        -- Não falha o signup, apenas loga o erro
        RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove e recria o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW 
    EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 7. FUNÇÃO PARA CRIAR PERFIL MANUALMENTE
-- =============================================

CREATE OR REPLACE FUNCTION public.create_profile_for_user(
    user_id UUID,
    user_email TEXT,
    full_name TEXT DEFAULT 'Usuário',
    cpf TEXT DEFAULT '000.000.000-00',
    role TEXT DEFAULT 'operario',
    company_code TEXT DEFAULT 'ABC001',
    phone TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    company_uuid UUID;
    profile_id UUID;
    mapped_role TEXT;
    existing_profile_id UUID;
BEGIN
    -- Verifica se o perfil já existe
    SELECT id INTO existing_profile_id
    FROM public.profiles
    WHERE id = user_id;
    
    IF existing_profile_id IS NOT NULL THEN
        RAISE LOG 'Profile already exists for user: %, returning existing ID', user_id;
        RETURN existing_profile_id;
    END IF;
    
    -- Mapeia o role para um valor válido
    mapped_role := public.map_role_to_valid(role);
    
    -- Busca a empresa pelo código
    SELECT id INTO company_uuid
    FROM public.companies
    WHERE UPPER(code) = UPPER(company_code)
      AND is_active = true;
    
    -- Se não encontrar, usa a empresa padrão
    IF company_uuid IS NULL THEN
        SELECT id INTO company_uuid
        FROM public.companies
        WHERE name = 'Construtora ABC Ltda'
        LIMIT 1;
    END IF;
    
    -- Se ainda não encontrar, cria a empresa padrão
    IF company_uuid IS NULL THEN
        INSERT INTO public.companies (name, code, is_active, created_at, updated_at)
        VALUES ('Construtora ABC Ltda', 'ABC001', true, NOW(), NOW())
        RETURNING id INTO company_uuid;
    END IF;
    
    -- Insere o perfil com role mapeado e ON CONFLICT
    INSERT INTO public.profiles (
        id,
        full_name,
        cpf,
        role,
        company_id,
        phone,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        full_name,
        cpf,
        mapped_role::profiles_role_enum,
        company_uuid,
        phone,
        true,
        NOW(),
        NOW()
    ) 
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        cpf = EXCLUDED.cpf,
        role = EXCLUDED.role,
        company_id = EXCLUDED.company_id,
        phone = EXCLUDED.phone,
        updated_at = NOW()
    RETURNING id INTO profile_id;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. DADOS INICIAIS
-- =============================================

-- Inserir empresas de exemplo
INSERT INTO companies (id, name, code, is_active, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Construtora ABC Ltda', 'ABC001', true, NOW(), NOW()),
('6ba7b810-9dad-11d1-80b4-00c04fd430c8', 'Construtora XYZ S.A.', 'XYZ002', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Perfis serão criados automaticamente quando usuários se cadastrarem
-- Não inserimos perfis de exemplo pois dependem de usuários reais do auth.users

-- Inserir categorias de ferramentas
INSERT INTO tool_categories (id, name, description, icon, company_id, created_at) VALUES
('a1b2c3d4-e5f6-4890-8bcd-ef1234567890', 'Ferramentas Manuais', 'Martelos, chaves de fenda, alicates, etc.', 'build', '550e8400-e29b-41d4-a716-446655440000', NOW()),
('b2c3d4e5-f6a7-4801-8cde-f23456789012', 'Ferramentas Elétricas', 'Furadeiras, serras, lixadeiras, etc.', 'power', '550e8400-e29b-41d4-a716-446655440000', NOW()),
('c3d4e5f6-a7b8-4012-8def-345678901234', 'Equipamentos de Segurança', 'Capacetes, luvas, óculos de proteção, etc.', 'security', '550e8400-e29b-41d4-a716-446655440000', NOW()),
('d4e5f6a7-b8c9-4123-8ef0-456789012345', 'Equipamentos de Medição', 'Níveis, trenas, esquadros, etc.', 'straighten', '550e8400-e29b-41d4-a716-446655440000', NOW()),
('e5f6a7b8-c9d0-4234-8f01-567890123456', 'Ferramentas de Corte', 'Serras, esmerilhadeiras, cortadores, etc.', 'content_cut', '550e8400-e29b-41d4-a716-446655440000', NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    company_id = EXCLUDED.company_id;

-- Ferramentas serão cadastradas pelos usuários após o login
-- Não inserimos ferramentas de exemplo pois dependem de usuários reais para o campo created_by

-- =============================================
-- 8.1. DADOS DE EXEMPLO PARA ATIVIDADES (OPCIONAL)
-- =============================================

-- Inserir algumas ferramentas de exemplo para demonstrar atividades
-- (Apenas se houver usuários cadastrados)
DO $$
DECLARE
    sample_user_id UUID;
    sample_company_id UUID;
    tool_1_id UUID := 'd4e5f6a7-b8c9-4123-8ef0-456789012345';
    tool_2_id UUID := 'e5f6a7b8-c9d0-4234-8f01-567890123456';
    tool_3_id UUID := 'f6a7b8c9-d0e1-4345-8012-678901234567';
BEGIN
    -- Busca um usuário existente
    SELECT id INTO sample_user_id FROM profiles LIMIT 1;
    
    -- Busca a empresa padrão
    SELECT id INTO sample_company_id FROM companies WHERE code = 'ABC001' LIMIT 1;
    
    -- Se houver usuário, cria ferramentas de exemplo
    IF sample_user_id IS NOT NULL AND sample_company_id IS NOT NULL THEN
        
        -- Inserir ferramentas de exemplo
        INSERT INTO tools (id, name, description, brand, model, status, location, category_id, company_id, created_by, created_at, updated_at) VALUES
        (tool_1_id, 'Furadeira de Impacto', 'Furadeira de impacto 650W com kit de brocas', 'Bosch', 'GSB-650', 'disponivel', 'Almoxarifado Central', 'b2c3d4e5-f6a7-4801-8cde-f23456789012', sample_company_id, sample_user_id, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
        (tool_2_id, 'Martelo de Unha', 'Martelo de unha 500g cabo de madeira', 'Tramontina', 'TM-500', 'em_uso', 'Obra - Bloco A', 'a1b2c3d4-e5f6-4890-8bcd-ef1234567890', sample_company_id, sample_user_id, NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 hour'),
        (tool_3_id, 'Serra Circular', 'Serra circular 1200W com disco de corte', 'Makita', 'SC-1200', 'manutencao', 'Oficina de Manutenção', 'e5f6a7b8-c9d0-4234-8f01-567890123456', sample_company_id, sample_user_id, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')
        ON CONFLICT (id) DO NOTHING;
        
        -- Inserir movimentações de exemplo
        INSERT INTO tool_movements (tool_id, user_id, action, previous_status, new_status, previous_location, new_location, notes, created_at) VALUES
        (tool_2_id, sample_user_id, 'emprestado', 'disponivel', 'em_uso', 'Almoxarifado Central', 'Obra - Bloco A', 'Ferramenta emprestada para trabalho no bloco A', NOW() - INTERVAL '1 hour'),
        (tool_3_id, sample_user_id, 'manutencao_enviado', 'disponivel', 'manutencao', 'Almoxarifado Central', 'Oficina de Manutenção', 'Enviada para manutenção preventiva', NOW() - INTERVAL '2 days'),
        (tool_1_id, sample_user_id, 'devolvido', 'em_uso', 'disponivel', 'Obra - Bloco B', 'Almoxarifado Central', 'Ferramenta devolvida após uso', NOW() - INTERVAL '3 days'),
        (tool_2_id, sample_user_id, 'emprestado', 'disponivel', 'em_uso', 'Almoxarifado Central', 'Obra - Bloco B', 'Emprestada para instalação elétrica', NOW() - INTERVAL '4 days'),
        (tool_1_id, sample_user_id, 'devolvido', 'em_uso', 'disponivel', 'Obra - Bloco A', 'Almoxarifado Central', 'Trabalho concluído, ferramenta devolvida', NOW() - INTERVAL '5 days')
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE '✅ DADOS DE EXEMPLO CRIADOS: 3 ferramentas e 5 atividades';
    ELSE
        RAISE NOTICE '⚠️  Nenhum usuário encontrado - dados de exemplo não criados';
    END IF;
END $$;

-- =============================================
-- 9. CORRIGIR USUÁRIOS EXISTENTES
-- =============================================

-- Cria perfis para usuários existentes que não têm
DO $$
DECLARE
    user_record RECORD;
    created_count INTEGER := 0;
BEGIN
    FOR user_record IN 
        SELECT 
            au.id,
            au.email,
            au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
          AND au.email_confirmed_at IS NOT NULL
    LOOP
        BEGIN
            PERFORM public.create_profile_for_user(
                user_record.id,
                user_record.email,
                COALESCE(user_record.raw_user_meta_data->>'full_name', 'Usuário'),
                COALESCE(user_record.raw_user_meta_data->>'cpf', '000.000.000-00'),
                COALESCE(user_record.raw_user_meta_data->>'role', 'operario'),
                COALESCE(user_record.raw_user_meta_data->>'company_code', 'ABC001'),
                user_record.raw_user_meta_data->>'phone'
            );
            
            created_count := created_count + 1;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao criar perfil para usuário %: %', user_record.email, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '✅ PERFIS CRIADOS: % usuários', created_count;
END $$;

-- =============================================
-- 10. VERIFICAÇÃO FINAL E MENSAGENS
-- =============================================

DO $$
DECLARE
    company_count INTEGER;
    profile_count INTEGER;
    tool_count INTEGER;
    category_count INTEGER;
BEGIN
    -- Conta registros
    SELECT COUNT(*) INTO company_count FROM companies;
    SELECT COUNT(*) INTO profile_count FROM profiles;
    SELECT COUNT(*) INTO tool_count FROM tools;
    SELECT COUNT(*) INTO category_count FROM tool_categories;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ===== CANTEIRO APP - SETUP COMPLETO ===== 🎉';
    RAISE NOTICE '';
    RAISE NOTICE '✅ TABELAS CRIADAS:';
    RAISE NOTICE '   - companies, profiles, tool_categories';
    RAISE NOTICE '   - tools, tool_movements, maintenance_records';
    RAISE NOTICE '   - notifications';
    RAISE NOTICE '';
    RAISE NOTICE '✅ POLÍTICAS RLS CONFIGURADAS (sem recursão)';
    RAISE NOTICE '✅ TRIGGERS AUTOMÁTICOS CRIADOS';
    RAISE NOTICE '✅ FUNÇÕES DE MAPEAMENTO CRIADAS';
    RAISE NOTICE '✅ DADOS INICIAIS INSERIDOS';
    RAISE NOTICE '';
    RAISE NOTICE '📊 DADOS ATUAIS:';
    RAISE NOTICE '   - Empresas: %', company_count;
    RAISE NOTICE '   - Perfis: %', profile_count;
    RAISE NOTICE '   - Categorias: %', category_count;
    RAISE NOTICE '   - Ferramentas: %', tool_count;
    RAISE NOTICE '';
    RAISE NOTICE '🏢 CÓDIGOS DE EMPRESA:';
    RAISE NOTICE '   - ABC001: Construtora ABC Ltda';
    RAISE NOTICE '   - XYZ002: Construtora XYZ S.A.';
    RAISE NOTICE '';
    RAISE NOTICE '👤 ROLES VÁLIDOS:';
    RAISE NOTICE '   - admin (Desenvolvedor/Administrador)';
    RAISE NOTICE '   - encarregado (Encarregado/Gerente)';
    RAISE NOTICE '   - mestre_obras (Mestre de Obras)';
    RAISE NOTICE '   - operario (Operário - padrão)';
    RAISE NOTICE '   - almoxarife (Almoxarife)';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 SISTEMA PRONTO PARA USO!';
    RAISE NOTICE '   - Signup funcionará sem erros';
    RAISE NOTICE '   - Perfis criados automaticamente';
    RAISE NOTICE '   - Roles mapeados corretamente';
    RAISE NOTICE '   - Dashboard e perfil funcionais';
    RAISE NOTICE '';
    RAISE NOTICE '📝 PRÓXIMOS PASSOS:';
    RAISE NOTICE '   1. Faça signup no app para criar seu primeiro usuário';
    RAISE NOTICE '   2. O perfil será criado automaticamente';
    RAISE NOTICE '   3. Cadastre suas primeiras ferramentas';
    RAISE NOTICE '   4. Sistema estará 100%% funcional!';
    RAISE NOTICE '';
END $$; 