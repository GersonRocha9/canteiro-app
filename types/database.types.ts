export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			companies: {
				Row: {
					id: string;
					name: string;
					code: string;
					address: string | null;
					phone: string | null;
					email: string | null;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					code: string;
					address?: string | null;
					phone?: string | null;
					email?: string | null;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					code?: string;
					address?: string | null;
					phone?: string | null;
					email?: string | null;
					created_at?: string;
					updated_at?: string;
				};
			};
			profiles: {
				Row: {
					id: string;
					full_name: string;
					cpf: string;
					role:
						| "admin"
						| "encarregado"
						| "mestre_obras"
						| "operario"
						| "almoxarife";
					company_id: string;
					avatar_url: string | null;
					phone: string | null;
					is_active: boolean;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id: string;
					full_name: string;
					cpf: string;
					role:
						| "admin"
						| "encarregado"
						| "mestre_obras"
						| "operario"
						| "almoxarife";
					company_id: string;
					avatar_url?: string | null;
					phone?: string | null;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					full_name?: string;
					cpf?: string;
					role?:
						| "admin"
						| "encarregado"
						| "mestre_obras"
						| "operario"
						| "almoxarife";
					company_id?: string;
					avatar_url?: string | null;
					phone?: string | null;
					is_active?: boolean;
					created_at?: string;
					updated_at?: string;
				};
			};
			tool_categories: {
				Row: {
					id: string;
					name: string;
					description: string | null;
					icon: string | null;
					company_id: string;
					created_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					description?: string | null;
					icon?: string | null;
					company_id: string;
					created_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					description?: string | null;
					icon?: string | null;
					company_id?: string;
					created_at?: string;
				};
			};
			tools: {
				Row: {
					id: string;
					name: string;
					description: string | null;
					serial_number: string | null;
					brand: string | null;
					model: string | null;
					purchase_date: string | null;
					purchase_price: number | null;
					status:
						| "disponivel"
						| "em_uso"
						| "manutencao"
						| "danificada"
						| "descartada";
					location: string;
					category_id: string | null;
					company_id: string;
					assigned_to: string | null;
					assigned_at: string | null;
					qr_code: string | null;
					photo_url: string | null;
					observations: string | null;
					next_maintenance_date: string | null;
					created_by: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					name: string;
					description?: string | null;
					serial_number?: string | null;
					brand?: string | null;
					model?: string | null;
					purchase_date?: string | null;
					purchase_price?: number | null;
					status?:
						| "disponivel"
						| "em_uso"
						| "manutencao"
						| "danificada"
						| "descartada";
					location: string;
					category_id?: string | null;
					company_id: string;
					assigned_to?: string | null;
					assigned_at?: string | null;
					qr_code?: string | null;
					photo_url?: string | null;
					observations?: string | null;
					next_maintenance_date?: string | null;
					created_by: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					name?: string;
					description?: string | null;
					serial_number?: string | null;
					brand?: string | null;
					model?: string | null;
					purchase_date?: string | null;
					purchase_price?: number | null;
					status?:
						| "disponivel"
						| "em_uso"
						| "manutencao"
						| "danificada"
						| "descartada";
					location?: string;
					category_id?: string | null;
					company_id?: string;
					assigned_to?: string | null;
					assigned_at?: string | null;
					qr_code?: string | null;
					photo_url?: string | null;
					observations?: string | null;
					next_maintenance_date?: string | null;
					created_by?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			tool_movements: {
				Row: {
					id: string;
					tool_id: string;
					user_id: string;
					action:
						| "emprestado"
						| "devolvido"
						| "manutencao_enviado"
						| "manutencao_retornado"
						| "transferido"
						| "descartado";
					previous_status: string | null;
					new_status: string;
					previous_location: string | null;
					new_location: string | null;
					previous_assigned_to: string | null;
					new_assigned_to: string | null;
					notes: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					tool_id: string;
					user_id: string;
					action:
						| "emprestado"
						| "devolvido"
						| "manutencao_enviado"
						| "manutencao_retornado"
						| "transferido"
						| "descartado";
					previous_status?: string | null;
					new_status: string;
					previous_location?: string | null;
					new_location?: string | null;
					previous_assigned_to?: string | null;
					new_assigned_to?: string | null;
					notes?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					tool_id?: string;
					user_id?: string;
					action?:
						| "emprestado"
						| "devolvido"
						| "manutencao_enviado"
						| "manutencao_retornado"
						| "transferido"
						| "descartado";
					previous_status?: string | null;
					new_status?: string;
					previous_location?: string | null;
					new_location?: string | null;
					previous_assigned_to?: string | null;
					new_assigned_to?: string | null;
					notes?: string | null;
					created_at?: string;
				};
			};
			maintenance_records: {
				Row: {
					id: string;
					tool_id: string;
					type: "preventiva" | "corretiva" | "emergencial";
					description: string;
					cost: number | null;
					technician_name: string | null;
					company_service: string | null;
					start_date: string;
					end_date: string | null;
					status: "agendada" | "em_andamento" | "concluida" | "cancelada";
					created_by: string;
					created_at: string;
					updated_at: string;
				};
				Insert: {
					id?: string;
					tool_id: string;
					type: "preventiva" | "corretiva" | "emergencial";
					description: string;
					cost?: number | null;
					technician_name?: string | null;
					company_service?: string | null;
					start_date: string;
					end_date?: string | null;
					status?: "agendada" | "em_andamento" | "concluida" | "cancelada";
					created_by: string;
					created_at?: string;
					updated_at?: string;
				};
				Update: {
					id?: string;
					tool_id?: string;
					type?: "preventiva" | "corretiva" | "emergencial";
					description?: string;
					cost?: number | null;
					technician_name?: string | null;
					company_service?: string | null;
					start_date?: string;
					end_date?: string | null;
					status?: "agendada" | "em_andamento" | "concluida" | "cancelada";
					created_by?: string;
					created_at?: string;
					updated_at?: string;
				};
			};
			notifications: {
				Row: {
					id: string;
					user_id: string;
					title: string;
					message: string;
					type: "info" | "warning" | "error" | "success";
					is_read: boolean;
					related_tool_id: string | null;
					related_movement_id: string | null;
					created_at: string;
				};
				Insert: {
					id?: string;
					user_id: string;
					title: string;
					message: string;
					type: "info" | "warning" | "error" | "success";
					is_read?: boolean;
					related_tool_id?: string | null;
					related_movement_id?: string | null;
					created_at?: string;
				};
				Update: {
					id?: string;
					user_id?: string;
					title?: string;
					message?: string;
					type?: "info" | "warning" | "error" | "success";
					is_read?: boolean;
					related_tool_id?: string | null;
					related_movement_id?: string | null;
					created_at?: string;
				};
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][T]["Update"];

// Specific types for our app
export type Company = Tables<"companies">;
export type Profile = Tables<"profiles">;
export type ToolCategory = Tables<"tool_categories">;
export type Tool = Tables<"tools">;
export type ToolMovement = Tables<"tool_movements">;
export type MaintenanceRecord = Tables<"maintenance_records">;
export type Notification = Tables<"notifications">;

// Extended types with relations
export type ToolWithRelations = Tool & {
	category?: ToolCategory;
	assigned_user?: Profile;
	company?: Company;
	recent_movements?: ToolMovement[];
	maintenance_records?: MaintenanceRecord[];
};

export type ToolMovementWithRelations = ToolMovement & {
	tool?: Tool;
	user?: Profile;
	previous_assigned_user?: Profile;
	new_assigned_user?: Profile;
};

export type MaintenanceRecordWithRelations = MaintenanceRecord & {
	tool?: Tool;
	created_by_user?: Profile;
};

export type NotificationWithRelations = Notification & {
	related_tool?: Tool;
	related_movement?: ToolMovement;
};

export type ProfileWithRelations = Profile & {
	company?: Company;
};

// Dashboard stats type
export type DashboardStats = {
	total_tools: number;
	available_tools: number;
	in_use_tools: number;
	maintenance_tools: number;
	damaged_tools: number;
	recent_activities: (ToolMovementWithRelations & {
		tool: Tool;
		user: Profile;
	})[];
};

// Tool status type
export type ToolStatus = Tool["status"];

// User role type
export type UserRole = Profile["role"];

// Movement action type
export type MovementAction = ToolMovement["action"];

// Maintenance type
export type MaintenanceType = MaintenanceRecord["type"];

// Maintenance status type
export type MaintenanceStatus = MaintenanceRecord["status"];

// Notification type
export type NotificationType = Notification["type"];
