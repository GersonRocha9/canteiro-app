-- =============================================
-- CANTEIRO APP - DATABASE SCHEMA
-- Sistema de Gestão de Ferramentas de Construção
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. COMPANIES TABLE
-- =============================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. PROFILES TABLE (extends auth.users)
-- =============================================
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'encarregado', 'mestre_obras', 'operario', 'almoxarife')),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    avatar_url TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. TOOL CATEGORIES TABLE
-- =============================================
CREATE TABLE tool_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 4. TOOLS TABLE
-- =============================================
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    serial_number TEXT,
    brand TEXT,
    model TEXT,
    purchase_date DATE,
    purchase_price DECIMAL(10,2),
    status TEXT NOT NULL DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'em_uso', 'manutencao', 'danificada', 'descartada')),
    location TEXT NOT NULL,
    category_id UUID REFERENCES tool_categories(id),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES profiles(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    qr_code TEXT UNIQUE,
    photo_url TEXT,
    observations TEXT,
    next_maintenance_date DATE,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. TOOL MOVEMENTS TABLE
-- =============================================
CREATE TABLE tool_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    action TEXT NOT NULL CHECK (action IN ('emprestado', 'devolvido', 'manutencao_enviado', 'manutencao_retornado', 'transferido', 'descartado')),
    previous_status TEXT,
    new_status TEXT NOT NULL,
    previous_location TEXT,
    new_location TEXT,
    previous_assigned_to UUID REFERENCES profiles(id),
    new_assigned_to UUID REFERENCES profiles(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. MAINTENANCE RECORDS TABLE
-- =============================================
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('preventiva', 'corretiva', 'emergencial')),
    description TEXT NOT NULL,
    cost DECIMAL(10,2),
    technician_name TEXT,
    company_service TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT false,
    related_tool_id UUID REFERENCES tools(id),
    related_movement_id UUID REFERENCES tool_movements(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_profiles_company_id ON profiles(company_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_tools_company_id ON tools(company_id);
CREATE INDEX idx_tools_status ON tools(status);
CREATE INDEX idx_tools_assigned_to ON tools(assigned_to);
CREATE INDEX idx_tools_category_id ON tools(category_id);
CREATE INDEX idx_tool_movements_tool_id ON tool_movements(tool_id);
CREATE INDEX idx_tool_movements_user_id ON tool_movements(user_id);
CREATE INDEX idx_tool_movements_created_at ON tool_movements(created_at);
CREATE INDEX idx_maintenance_records_tool_id ON maintenance_records(tool_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tools_updated_at BEFORE UPDATE ON tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTION TO CREATE TOOL MOVEMENT
-- =============================================
CREATE OR REPLACE FUNCTION create_tool_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- Create movement record when tool status changes
    IF (TG_OP = 'UPDATE' AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.assigned_to IS DISTINCT FROM NEW.assigned_to OR OLD.location IS DISTINCT FROM NEW.location)) THEN
        INSERT INTO tool_movements (
            tool_id,
            user_id,
            action,
            previous_status,
            new_status,
            previous_location,
            new_location,
            previous_assigned_to,
            new_assigned_to,
            notes
        ) VALUES (
            NEW.id,
            auth.uid(),
            CASE 
                WHEN NEW.status = 'em_uso' AND OLD.status = 'disponivel' THEN 'emprestado'
                WHEN NEW.status = 'disponivel' AND OLD.status = 'em_uso' THEN 'devolvido'
                WHEN NEW.status = 'manutencao' THEN 'manutencao_enviado'
                WHEN OLD.status = 'manutencao' AND NEW.status != 'manutencao' THEN 'manutencao_retornado'
                ELSE 'transferido'
            END,
            OLD.status,
            NEW.status,
            OLD.location,
            NEW.location,
            OLD.assigned_to,
            NEW.assigned_to,
            'Movimento automático gerado pelo sistema'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER tool_movement_trigger
    AFTER UPDATE ON tools
    FOR EACH ROW
    EXECUTE FUNCTION create_tool_movement();

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (
        id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Profiles policies
CREATE POLICY "Users can view profiles from their company" ON profiles
    FOR SELECT USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Tool categories policies
CREATE POLICY "Users can view categories from their company" ON tool_categories
    FOR SELECT USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Admins and managers can manage categories" ON tool_categories
    FOR ALL USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
        AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'encarregado', 'almoxarife')
    );

-- Tools policies
CREATE POLICY "Users can view tools from their company" ON tools
    FOR SELECT USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "Authorized users can manage tools" ON tools
    FOR ALL USING (
        company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
        AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'encarregado', 'almoxarife')
    );

CREATE POLICY "Users can update tools assigned to them" ON tools
    FOR UPDATE USING (
        assigned_to = auth.uid()
        AND company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
    );

-- Tool movements policies
CREATE POLICY "Users can view movements from their company tools" ON tool_movements
    FOR SELECT USING (
        tool_id IN (
            SELECT id FROM tools 
            WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Users can create movements for company tools" ON tool_movements
    FOR INSERT WITH CHECK (
        tool_id IN (
            SELECT id FROM tools 
            WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Maintenance records policies
CREATE POLICY "Users can view maintenance records from their company tools" ON maintenance_records
    FOR SELECT USING (
        tool_id IN (
            SELECT id FROM tools 
            WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Authorized users can manage maintenance records" ON maintenance_records
    FOR ALL USING (
        tool_id IN (
            SELECT id FROM tools 
            WHERE company_id = (SELECT company_id FROM profiles WHERE id = auth.uid())
        )
        AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'encarregado', 'almoxarife')
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample company
INSERT INTO companies (id, name, code, address, phone, email) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Construtora ABC Ltda', 'ABC001', 'Av. Paulista, 1000 - São Paulo, SP', '(11) 3333-4444', 'contato@construtorabc.com.br');

-- Insert sample profile for the specified user
INSERT INTO profiles (id, full_name, cpf, role, company_id, phone) VALUES 
('788c25fa-fc60-45d2-a118-bf4fb2e39ea5', 'João Silva Santos', '123.456.789-00', 'encarregado', '550e8400-e29b-41d4-a716-446655440000', '(11) 99999-8888')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    cpf = EXCLUDED.cpf,
    role = EXCLUDED.role,
    company_id = EXCLUDED.company_id,
    phone = EXCLUDED.phone;

-- Insert tool categories
INSERT INTO tool_categories (id, name, description, icon, company_id) VALUES 
('cat-1', 'Ferramentas Elétricas', 'Furadeiras, serras, lixadeiras', 'electrical_services', '550e8400-e29b-41d4-a716-446655440000'),
('cat-2', 'Ferramentas Manuais', 'Martelos, chaves, alicates', 'handyman', '550e8400-e29b-41d4-a716-446655440000'),
('cat-3', 'Equipamentos de Medição', 'Níveis, trenas, esquadros', 'straighten', '550e8400-e29b-41d4-a716-446655440000'),
('cat-4', 'Equipamentos de Segurança', 'Capacetes, luvas, óculos', 'security', '550e8400-e29b-41d4-a716-446655440000'),
('cat-5', 'Ferramentas de Corte', 'Serras, esmerilhadeiras', 'content_cut', '550e8400-e29b-41d4-a716-446655440000');

-- Insert sample tools for the user
INSERT INTO tools (id, name, description, serial_number, brand, model, status, location, category_id, company_id, qr_code, observations, created_by) VALUES 
('tool-1', 'Furadeira de Impacto', 'Furadeira de impacto Black & Decker 650W com kit completo de brocas', 'BD-FI-001', 'Black & Decker', 'HD650K', 'disponivel', 'Almoxarifado A - Prateleira 1', 'cat-1', '550e8400-e29b-41d4-a716-446655440000', 'QR001', 'Ferramenta em excelente estado. Última manutenção em dezembro/2023.', '788c25fa-fc60-45d2-a118-bf4fb2e39ea5'),

('tool-2', 'Martelo de Unha 25mm', 'Martelo de unha cabo de madeira 25mm - uso geral', 'MT-UN-002', 'Tramontina', 'Basic', 'em_uso', 'Obra - Bloco B - 2º Andar', 'cat-2', '550e8400-e29b-41d4-a716-446655440000', 'QR002', 'Martelo padrão para uso geral.', '788c25fa-fc60-45d2-a118-bf4fb2e39ea5'),

('tool-3', 'Serra Circular 1200W', 'Serra circular Makita 1200W com disco de corte para madeira', 'MK-SC-003', 'Makita', '5007MG', 'manutencao', 'Oficina de Manutenção', 'cat-5', '550e8400-e29b-41d4-a716-446655440000', 'QR003', 'Em manutenção - troca de disco e revisão geral.', '788c25fa-fc60-45d2-a118-bf4fb2e39ea5'),

('tool-4', 'Conjunto de Chaves de Fenda', 'Kit com 8 chaves de fenda e phillips de vários tamanhos', 'CH-KT-004', 'Gedore', 'Kit8', 'disponivel', 'Almoxarifado B - Gaveta 3', 'cat-2', '550e8400-e29b-41d4-a716-446655440000', 'QR004', 'Kit completo, todas as peças presentes.', '788c25fa-fc60-45d2-a118-bf4fb2e39ea5'),

('tool-5', 'Nível a Laser', 'Nível a laser Bosch com tripé e alcance de 30m', 'BS-NL-005', 'Bosch', 'GLL 3-80', 'disponivel', 'Almoxarifado A - Prateleira 2', 'cat-3', '550e8400-e29b-41d4-a716-446655440000', 'QR005', 'Equipamento de precisão - manter na caixa quando não em uso.', '788c25fa-fc60-45d2-a118-bf4fb2e39ea5'),

('tool-6', 'Parafusadeira sem Fio', 'Parafusadeira DeWalt 20V com 2 baterias e carregador', 'DW-PS-006', 'DeWalt', 'DCD771C2', 'em_uso', 'Obra - Bloco A - Térreo', 'cat-1', '550e8400-e29b-41d4-a716-446655440000', 'QR006', 'Inclui maleta com bits variados.', '788c25fa-fc60-45d2-a118-bf4fb2e39ea5'),

('tool-7', 'Alicate Universal 8"', 'Alicate universal 8 polegadas cabo isolado', 'AL-UN-007', 'Irwin', '8"', 'disponivel', 'Almoxarifado B - Gaveta 1', 'cat-2', '550e8400-e29b-41d4-a716-446655440000', 'QR007', 'Cabo isolado até 1000V.', '788c25fa-fc60-45d2-a118-bf4fb2e39ea5'),

('tool-8', 'Trena Eletrônica 40m', 'Trena eletrônica Leica com laser e memória', 'LC-TR-008', 'Leica', 'DISTO D2', 'disponivel', 'Almoxarifado A - Prateleira 2', 'cat-3', '550e8400-e29b-41d4-a716-446655440000', 'QR008', 'Equipamento de alta precisão - cuidado com quedas.', '788c25fa-fc60-45d2-a118-bf4fb2e39ea5'),

('tool-9', 'Esmerilhadeira Angular 7"', 'Esmerilhadeira angular Bosch 2200W - 7 polegadas', 'BS-EA-009', 'Bosch', 'GWS 22-180', 'danificada', 'Oficina - Área de Descarte', 'cat-5', '550e8400-e29b-41d4-a716-446655440000', 'QR009', 'Motor queimado - aguardando orçamento de reparo.', '788c25fa-fc60-45d2-a118-bf4fb2e39ea5'),

('tool-10', 'Kit de Segurança Completo', 'Capacete, óculos, luvas e protetor auricular', 'KS-CP-010', 'Vários', 'Kit Básico', 'disponivel', 'Almoxarifado - Área EPI', 'cat-4', '550e8400-e29b-41d4-a716-446655440000', 'QR010', 'Kit de EPI completo - verificar validade dos itens.', '788c25fa-fc60-45d2-a118-bf4fb2e39ea5');

-- Update some tools to be assigned to users
UPDATE tools SET 
    assigned_to = '788c25fa-fc60-45d2-a118-bf4fb2e39ea5',
    assigned_at = NOW() - INTERVAL '2 hours'
WHERE id IN ('tool-2', 'tool-6');

-- Insert sample maintenance records
INSERT INTO maintenance_records (tool_id, type, description, cost, technician_name, start_date, end_date, status, created_by) VALUES 
('tool-3', 'corretiva', 'Troca de disco de corte e revisão do motor', 85.00, 'Pedro Costa', '2024-01-10', '2024-01-12', 'concluida', '788c25fa-fc60-45d2-a118-bf4fb2e39ea5'),
('tool-1', 'preventiva', 'Limpeza geral, lubrificação e teste de funcionamento', 30.00, 'Ana Silva', '2023-12-15', '2023-12-15', 'concluida', '788c25fa-fc60-45d2-a118-bf4fb2e39ea5'),
('tool-9', 'corretiva', 'Diagnóstico de motor queimado - aguardando orçamento', 0.00, 'Carlos Técnico', '2024-01-08', NULL, 'em_andamento', '788c25fa-fc60-45d2-a118-bf4fb2e39ea5');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, related_tool_id) VALUES 
('788c25fa-fc60-45d2-a118-bf4fb2e39ea5', 'Manutenção Concluída', 'A serra circular foi reparada e está disponível para uso.', 'success', 'tool-3'),
('788c25fa-fc60-45d2-a118-bf4fb2e39ea5', 'Ferramenta Danificada', 'Esmerilhadeira angular apresentou problema no motor.', 'warning', 'tool-9'),
('788c25fa-fc60-45d2-a118-bf4fb2e39ea5', 'Manutenção Preventiva', 'Nível a laser precisa de calibração até 25/01/2024.', 'info', 'tool-5'); 