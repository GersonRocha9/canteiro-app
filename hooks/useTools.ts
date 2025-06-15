import { supabase } from "@/config/supabase";
import {
	InsertTables,
	ToolStatus,
	ToolWithRelations,
	UpdateTables,
} from "@/types/database.types";
import { useCallback, useEffect, useState } from "react";

export interface UseToolsOptions {
	status?: ToolStatus | "all";
	limit?: number;
	searchQuery?: string;
}

export function useTools(options: UseToolsOptions = {}) {
	const [tools, setTools] = useState<ToolWithRelations[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshing, setRefreshing] = useState(false);

	const fetchTools = useCallback(async () => {
		try {
			setError(null);

			let query = supabase
				.from("tools")
				.select(
					`
          *,
          category:tool_categories(*),
          assigned_user:profiles!tools_assigned_to_fkey(*),
          company:companies(*)
        `,
				)
				.order("created_at", { ascending: false });

			// Apply status filter
			if (options.status && options.status !== "all") {
				query = query.eq("status", options.status);
			}

			// Apply search filter
			if (options.searchQuery && options.searchQuery.trim()) {
				const searchTerm = `%${options.searchQuery.trim()}%`;
				query = query.or(
					`name.ilike.${searchTerm},description.ilike.${searchTerm},serial_number.ilike.${searchTerm}`,
				);
			}

			// Apply limit
			if (options.limit) {
				query = query.limit(options.limit);
			}

			const { data, error } = await query;

			if (error) throw error;

			setTools((data as ToolWithRelations[]) || []);
		} catch (err) {
			console.error("Error fetching tools:", err);
			setError(
				err instanceof Error ? err.message : "Erro ao carregar ferramentas",
			);
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [options.status, options.limit, options.searchQuery]);

	const refresh = useCallback(async () => {
		setRefreshing(true);
		await fetchTools();
	}, [fetchTools]);

	const createTool = useCallback(async (toolData: InsertTables<"tools">) => {
		try {
			setError(null);

			const { data, error } = await supabase
				.from("tools")
				.insert(toolData)
				.select(
					`
          *,
          category:tool_categories(*),
          assigned_user:profiles!tools_assigned_to_fkey(*),
          company:companies(*)
        `,
				)
				.single();

			if (error) throw error;

			// Add the new tool to the local state
			if (data) {
				setTools((prev) => [data as ToolWithRelations, ...prev]);
			}

			return { data: data as ToolWithRelations, error: null };
		} catch (err) {
			console.error("Error creating tool:", err);
			const errorMessage =
				err instanceof Error ? err.message : "Erro ao criar ferramenta";
			setError(errorMessage);
			return { data: null, error: errorMessage };
		}
	}, []);

	const updateTool = useCallback(
		async (toolId: string, updates: UpdateTables<"tools">) => {
			try {
				setError(null);

				const { data, error } = await supabase
					.from("tools")
					.update(updates)
					.eq("id", toolId)
					.select(
						`
          *,
          category:tool_categories(*),
          assigned_user:profiles!tools_assigned_to_fkey(*),
          company:companies(*)
        `,
					)
					.single();

				if (error) throw error;

				// Update the tool in local state
				if (data) {
					setTools((prev) =>
						prev.map((tool) =>
							tool.id === toolId ? (data as ToolWithRelations) : tool,
						),
					);
				}

				return { data: data as ToolWithRelations, error: null };
			} catch (err) {
				console.error("Error updating tool:", err);
				const errorMessage =
					err instanceof Error ? err.message : "Erro ao atualizar ferramenta";
				setError(errorMessage);
				return { data: null, error: errorMessage };
			}
		},
		[],
	);

	const deleteTool = useCallback(async (toolId: string) => {
		try {
			setError(null);

			const { error } = await supabase.from("tools").delete().eq("id", toolId);

			if (error) throw error;

			// Remove the tool from local state
			setTools((prev) => prev.filter((tool) => tool.id !== toolId));

			return { error: null };
		} catch (err) {
			console.error("Error deleting tool:", err);
			const errorMessage =
				err instanceof Error ? err.message : "Erro ao excluir ferramenta";
			setError(errorMessage);
			return { error: errorMessage };
		}
	}, []);

	const assignTool = useCallback(
		async (toolId: string, userId: string) => {
			return updateTool(toolId, {
				assigned_to: userId,
				assigned_at: new Date().toISOString(),
				status: "em_uso",
			});
		},
		[updateTool],
	);

	const returnTool = useCallback(
		async (toolId: string) => {
			return updateTool(toolId, {
				assigned_to: null,
				assigned_at: null,
				status: "disponivel",
			});
		},
		[updateTool],
	);

	const sendToMaintenance = useCallback(
		async (toolId: string, location: string = "Oficina de Manutenção") => {
			return updateTool(toolId, {
				status: "manutencao",
				location,
				assigned_to: null,
				assigned_at: null,
			});
		},
		[updateTool],
	);

	useEffect(() => {
		fetchTools();
	}, [fetchTools]);

	return {
		tools,
		loading,
		error,
		refreshing,
		refresh,
		createTool,
		updateTool,
		deleteTool,
		assignTool,
		returnTool,
		sendToMaintenance,
	};
}
