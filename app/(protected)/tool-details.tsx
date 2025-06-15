import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, P } from "@/components/ui/typography";
import { supabase } from "@/config/supabase";
import { useProfile } from "@/hooks/useProfile";
import { MaintenanceRecord, ToolWithRelations } from "@/types/database.types";

const statusConfig = {
	disponivel: {
		label: "Disponível",
		color: "#10b981",
		bgColor: "bg-green-100",
		textColor: "text-green-800",
		icon: "check-circle" as const,
	},
	em_uso: {
		label: "Em Uso",
		color: "#f59e0b",
		bgColor: "bg-amber-100",
		textColor: "text-amber-800",
		icon: "schedule" as const,
	},
	manutencao: {
		label: "Em Manutenção",
		color: "#ef4444",
		bgColor: "bg-red-100",
		textColor: "text-red-800",
		icon: "build-circle" as const,
	},
	danificada: {
		label: "Danificada",
		color: "#6b7280",
		bgColor: "bg-gray-100",
		textColor: "text-gray-800",
		icon: "error" as const,
	},
	descartada: {
		label: "Descartada",
		color: "#374151",
		bgColor: "bg-gray-200",
		textColor: "text-gray-900",
		icon: "delete" as const,
	},
};

export default function ToolDetails() {
	const { toolId } = useLocalSearchParams<{ toolId: string }>();
	const { profile } = useProfile();

	const [tool, setTool] = useState<ToolWithRelations | null>(null);
	const [maintenanceRecords, setMaintenanceRecords] = useState<
		MaintenanceRecord[]
	>([]);
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const fetchToolDetails = async () => {
		if (!toolId) return;

		try {
			setError(null);

			// Fetch tool details
			const { data: toolData, error: toolError } = await supabase
				.from("tools")
				.select(
					`
					*,
					category:tool_categories(*),
					assigned_user:profiles!tools_assigned_to_fkey(*),
					company:companies(*)
				`,
				)
				.eq("id", toolId)
				.single();

			if (toolError) throw toolError;

			setTool(toolData as ToolWithRelations);

			// Fetch maintenance records
			const { data: maintenanceData, error: maintenanceError } = await supabase
				.from("maintenance_records")
				.select("*")
				.eq("tool_id", toolId)
				.order("created_at", { ascending: false });

			if (maintenanceError) throw maintenanceError;

			setMaintenanceRecords(maintenanceData || []);
		} catch (err) {
			console.error("Error fetching tool details:", err);
			setError(
				err instanceof Error
					? err.message
					: "Erro ao carregar detalhes da ferramenta",
			);
		} finally {
			setLoading(false);
		}
	};

	const updateToolStatus = async (
		newStatus: string,
		assignedTo?: string | null,
	) => {
		if (!tool || !profile) return;

		try {
			setUpdating(true);
			setError(null);

			const updates: any = {
				status: newStatus,
			};

			if (assignedTo !== undefined) {
				updates.assigned_to = assignedTo;
				updates.assigned_at = assignedTo ? new Date().toISOString() : null;
			}

			const { data, error } = await supabase
				.from("tools")
				.update(updates)
				.eq("id", tool.id)
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

			setTool(data as ToolWithRelations);

			// Show success message
			Alert.alert("Sucesso", "Status da ferramenta atualizado com sucesso!");
		} catch (err) {
			console.error("Error updating tool:", err);
			const errorMessage =
				err instanceof Error ? err.message : "Erro ao atualizar ferramenta";
			setError(errorMessage);
			Alert.alert("Erro", errorMessage);
		} finally {
			setUpdating(false);
		}
	};

	const handleLendTool = () => {
		if (!profile) return;

		Alert.alert(
			"Emprestar Ferramenta",
			"Deseja emprestar esta ferramenta para você?",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Confirmar",
					onPress: () => updateToolStatus("em_uso", profile.id),
				},
			],
		);
	};

	const handleReturnTool = () => {
		Alert.alert("Devolver Ferramenta", "Deseja devolver esta ferramenta?", [
			{ text: "Cancelar", style: "cancel" },
			{
				text: "Confirmar",
				onPress: () => updateToolStatus("disponivel", null),
			},
		]);
	};

	const handleSendToMaintenance = () => {
		Alert.alert(
			"Enviar para Manutenção",
			"Deseja enviar esta ferramenta para manutenção?",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Confirmar",
					onPress: () => updateToolStatus("manutencao", null),
				},
			],
		);
	};

	useEffect(() => {
		fetchToolDetails();
	}, [toolId]);

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 p-4">
					<View className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
					<View className="bg-card rounded-lg p-4 border border-border mb-4">
						<View className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
						<View className="h-4 bg-gray-200 rounded w-full mb-4" />
						<View className="h-10 bg-gray-200 rounded w-24" />
					</View>
					{Array.from({ length: 3 }).map((_, index) => (
						<View key={index} className="h-4 bg-gray-200 rounded w-full mb-2" />
					))}
				</View>
			</SafeAreaView>
		);
	}

	if (error || !tool) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center p-4">
					<MaterialIcons name="error-outline" size={64} color="#ef4444" />
					<Text className="text-lg font-medium text-center mt-4 mb-2">
						{error || "Ferramenta não encontrada"}
					</Text>
					<Button onPress={() => router.back()}>
						<Text className="text-primary-foreground">Voltar</Text>
					</Button>
				</View>
			</SafeAreaView>
		);
	}

	const config = statusConfig[tool.status];
	const canLend = tool.status === "disponivel";
	const canReturn =
		tool.status === "em_uso" && tool.assigned_to === profile?.id;
	const canSendToMaintenance = ["disponivel", "em_uso"].includes(tool.status);

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="p-4 gap-6">
					{/* Header */}
					<View className="flex-row items-center gap-3 mb-4">
						<TouchableOpacity
							onPress={() => router.back()}
							className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border"
						>
							<MaterialIcons name="arrow-back" size={20} color="#6b7280" />
						</TouchableOpacity>
						<H1 className="flex-1 text-xl font-bold text-foreground">
							Detalhes da Ferramenta
						</H1>
					</View>

					{/* Tool Info */}
					<View className="bg-card rounded-lg p-4 border border-border">
						<View className="flex-row items-start justify-between mb-4">
							<View className="flex-1 mr-4">
								<H2 className="text-lg font-bold text-foreground mb-1">
									{tool.name}
								</H2>
								{tool.description && (
									<P className="text-muted-foreground mb-3">
										{tool.description}
									</P>
								)}
							</View>
							<View
								className={`px-3 py-2 rounded-full ${config.bgColor} flex-row items-center gap-2`}
							>
								<MaterialIcons
									name={config.icon}
									size={16}
									color={config.color}
								/>
								<Text className={`text-sm font-semibold ${config.textColor}`}>
									{config.label}
								</Text>
							</View>
						</View>

						{/* Tool Details Grid */}
						<View className="gap-4">
							<View className="flex-row items-center gap-3">
								<MaterialIcons name="location-on" size={20} color="#6b7280" />
								<View>
									<Text className="text-sm text-muted-foreground">
										Localização
									</Text>
									<Text className="font-medium text-foreground">
										{tool.location}
									</Text>
								</View>
							</View>

							{tool.category && (
								<View className="flex-row items-center gap-3">
									<MaterialIcons name="category" size={20} color="#6b7280" />
									<View>
										<Text className="text-sm text-muted-foreground">
											Categoria
										</Text>
										<Text className="font-medium text-foreground">
											{tool.category.name}
										</Text>
									</View>
								</View>
							)}

							{tool.serial_number && (
								<View className="flex-row items-center gap-3">
									<MaterialIcons name="tag" size={20} color="#6b7280" />
									<View>
										<Text className="text-sm text-muted-foreground">
											Número de Série
										</Text>
										<Text className="font-medium text-foreground">
											{tool.serial_number}
										</Text>
									</View>
								</View>
							)}

							{tool.brand && (
								<View className="flex-row items-center gap-3">
									<MaterialIcons name="business" size={20} color="#6b7280" />
									<View>
										<Text className="text-sm text-muted-foreground">Marca</Text>
										<Text className="font-medium text-foreground">
											{tool.brand}
										</Text>
									</View>
								</View>
							)}

							{tool.model && (
								<View className="flex-row items-center gap-3">
									<MaterialIcons name="info" size={20} color="#6b7280" />
									<View>
										<Text className="text-sm text-muted-foreground">
											Modelo
										</Text>
										<Text className="font-medium text-foreground">
											{tool.model}
										</Text>
									</View>
								</View>
							)}

							{tool.assigned_user && (
								<View className="flex-row items-center gap-3">
									<MaterialIcons name="person" size={20} color="#6b7280" />
									<View>
										<Text className="text-sm text-muted-foreground">
											Atribuída para
										</Text>
										<Text className="font-medium text-foreground">
											{tool.assigned_user.full_name}
										</Text>
									</View>
								</View>
							)}

							{tool.observations && (
								<View className="flex-row gap-3">
									<MaterialIcons name="notes" size={20} color="#6b7280" />
									<View className="flex-1">
										<Text className="text-sm text-muted-foreground">
											Observações
										</Text>
										<Text className="font-medium text-foreground">
											{tool.observations}
										</Text>
									</View>
								</View>
							)}
						</View>
					</View>

					{/* Actions */}
					<View className="gap-3">
						<H2 className="text-lg font-semibold text-foreground">Ações</H2>

						{canLend && (
							<Button
								variant="default"
								onPress={handleLendTool}
								disabled={updating}
								className="w-full"
							>
								<View className="flex-row items-center justify-center gap-2">
									<MaterialIcons name="outbound" size={20} color="white" />
									<Text className="text-primary-foreground font-semibold">
										Emprestar Ferramenta
									</Text>
								</View>
							</Button>
						)}

						{canReturn && (
							<Button
								variant="secondary"
								onPress={handleReturnTool}
								disabled={updating}
								className="w-full"
							>
								<View className="flex-row items-center justify-center gap-2">
									<MaterialIcons
										name="assignment-return"
										size={20}
										color="#6b7280"
									/>
									<Text className="text-secondary-foreground font-semibold">
										Devolver Ferramenta
									</Text>
								</View>
							</Button>
						)}

						{canSendToMaintenance && (
							<Button
								variant="outline"
								onPress={handleSendToMaintenance}
								disabled={updating}
								className="w-full"
							>
								<View className="flex-row items-center justify-center gap-2">
									<MaterialIcons name="build" size={20} color="#6b7280" />
									<Text className="text-muted-foreground font-semibold">
										Enviar para Manutenção
									</Text>
								</View>
							</Button>
						)}
					</View>

					{/* Maintenance History */}
					{maintenanceRecords.length > 0 && (
						<View className="gap-3">
							<H2 className="text-lg font-semibold text-foreground">
								Histórico de Manutenção
							</H2>
							<View className="gap-3">
								{maintenanceRecords.slice(0, 3).map((record) => (
									<View
										key={record.id}
										className="bg-card rounded-lg p-4 border border-border"
									>
										<View className="flex-row items-center justify-between mb-2">
											<Text className="font-semibold text-foreground capitalize">
												{record.type.replace("_", " ")}
											</Text>
											<Text
												className={`text-xs px-2 py-1 rounded ${
													record.status === "concluida"
														? "bg-green-100 text-green-800"
														: record.status === "em_andamento"
															? "bg-blue-100 text-blue-800"
															: "bg-gray-100 text-gray-800"
												}`}
											>
												{record.status.replace("_", " ")}
											</Text>
										</View>
										<Text className="text-sm text-muted-foreground mb-2">
											{record.description}
										</Text>
										<Text className="text-xs text-muted-foreground">
											{new Date(record.start_date).toLocaleDateString("pt-BR")}
											{record.end_date &&
												` - ${new Date(record.end_date).toLocaleDateString("pt-BR")}`}
										</Text>
									</View>
								))}
							</View>
						</View>
					)}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
