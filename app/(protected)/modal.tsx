import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Alert, ScrollView, View } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2 } from "@/components/ui/typography";

// Mock tool data - em produção viria dos params da rota ou do Supabase
const mockTool = {
	id: 1,
	name: "Furadeira Elétrica",
	description: "Furadeira Black & Decker 650W com kit de brocas",
	serialNumber: "BD-650-001",
	status: "disponivel",
	location: "Almoxarifado A - Prateleira 3",
	assignedTo: null,
	category: "Ferramenta Elétrica",
	lastUsed: "15/01/2024",
	createdAt: "10/12/2023",
	observations:
		"Ferramenta em excelente estado. Última manutenção em dezembro/2023.",
	maintenanceHistory: [
		{
			id: 1,
			date: "15/12/2023",
			type: "Manutenção Preventiva",
			description: "Limpeza geral e lubrificação",
			technician: "Pedro Costa",
		},
		{
			id: 2,
			date: "20/11/2023",
			type: "Reparo",
			description: "Troca do cabo de alimentação",
			technician: "Ana Silva",
		},
	],
};

const statusColors = {
	disponivel: "#10b981",
	em_uso: "#f59e0b",
	manutencao: "#ef4444",
	danificada: "#6b7280",
};

const statusLabels = {
	disponivel: "Disponível",
	em_uso: "Em Uso",
	manutencao: "Em Manutenção",
	danificada: "Danificada",
};

const statusIcons = {
	disponivel: "check-circle" as const,
	em_uso: "schedule" as const,
	manutencao: "build-circle" as const,
	danificada: "error" as const,
};

interface InfoRowProps {
	icon: keyof typeof MaterialIcons.glyphMap;
	label: string;
	value: string;
	color?: string;
}

function InfoRow({ icon, label, value, color = "#6b7280" }: InfoRowProps) {
	return (
		<View className="flex-row items-center gap-3 py-2">
			<MaterialIcons name={icon} size={20} color={color} />
			<View className="flex-1">
				<Text className="text-sm text-muted-foreground">{label}</Text>
				<Text className="font-medium text-foreground">{value}</Text>
			</View>
		</View>
	);
}

export default function ToolDetail() {
	const statusColor =
		statusColors[mockTool.status as keyof typeof statusColors];
	const statusLabel =
		statusLabels[mockTool.status as keyof typeof statusLabels];
	const statusIcon = statusIcons[mockTool.status as keyof typeof statusIcons];

	const handleAction = (action: string) => {
		Alert.alert(
			"Confirmar ação",
			`Deseja ${action.toLowerCase()} esta ferramenta?`,
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Confirmar",
					onPress: () => {
						console.log(`Ação ${action} executada`);
						Alert.alert(
							"Sucesso!",
							`Ferramenta ${action.toLowerCase()}a com sucesso.`,
						);
					},
				},
			],
		);
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="p-4 gap-6">
					{/* Header */}
					<View className="flex-row items-center gap-4">
						<Button size="sm" variant="ghost" onPress={() => router.back()}>
							<MaterialIcons name="close" size={24} color="#6b7280" />
						</Button>
						<View className="flex-1">
							<H1 className="text-xl font-bold text-foreground">
								Detalhes da Ferramenta
							</H1>
						</View>
						<Button
							size="sm"
							variant="ghost"
							onPress={() => console.log("Editar ferramenta")}
						>
							<MaterialIcons name="edit" size={24} color="#6b7280" />
						</Button>
					</View>

					{/* Tool Info Card */}
					<View className="bg-card rounded-lg p-6 border border-border">
						<View className="items-center gap-4">
							<View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center">
								<MaterialIcons name="build" size={40} color="#3b82f6" />
							</View>
							<View className="items-center gap-2">
								<H2 className="text-xl font-bold text-foreground text-center">
									{mockTool.name}
								</H2>
								<View className="flex-row items-center gap-2">
									<MaterialIcons
										name={statusIcon}
										size={20}
										color={statusColor}
									/>
									<Text className="font-medium" style={{ color: statusColor }}>
										{statusLabel}
									</Text>
								</View>
								<Text className="text-sm text-muted-foreground text-center">
									#{mockTool.serialNumber}
								</Text>
							</View>
						</View>
					</View>

					{/* Basic Info */}
					<View className="gap-4">
						<H2 className="text-lg font-semibold text-foreground">
							Informações Básicas
						</H2>
						<View className="bg-card rounded-lg p-4 border border-border gap-2">
							<InfoRow
								icon="description"
								label="Descrição"
								value={mockTool.description}
							/>
							<InfoRow
								icon="category"
								label="Categoria"
								value={mockTool.category}
							/>
							<InfoRow
								icon="location-on"
								label="Localização Atual"
								value={mockTool.location}
							/>
							{mockTool.assignedTo && (
								<InfoRow
									icon="person"
									label="Responsável"
									value={mockTool.assignedTo}
								/>
							)}
							<InfoRow
								icon="calendar-today"
								label="Último Uso"
								value={mockTool.lastUsed}
							/>
						</View>
					</View>

					{/* Observations */}
					{mockTool.observations && (
						<View className="gap-4">
							<H2 className="text-lg font-semibold text-foreground">
								Observações
							</H2>
							<View className="bg-card rounded-lg p-4 border border-border">
								<Text className="text-foreground leading-relaxed">
									{mockTool.observations}
								</Text>
							</View>
						</View>
					)}

					{/* Maintenance History */}
					<View className="gap-4">
						<H2 className="text-lg font-semibold text-foreground">
							Histórico de Manutenção
						</H2>
						<View className="gap-3">
							{mockTool.maintenanceHistory.map((maintenance) => (
								<View
									key={maintenance.id}
									className="bg-card rounded-lg p-4 border border-border"
								>
									<View className="flex-row items-start justify-between mb-2">
										<Text className="font-medium text-foreground">
											{maintenance.type}
										</Text>
										<Text className="text-sm text-muted-foreground">
											{maintenance.date}
										</Text>
									</View>
									<Text className="text-sm text-muted-foreground mb-2">
										{maintenance.description}
									</Text>
									<View className="flex-row items-center gap-1">
										<MaterialIcons name="person" size={16} color="#6b7280" />
										<Text className="text-xs text-muted-foreground">
											{maintenance.technician}
										</Text>
									</View>
								</View>
							))}
						</View>
					</View>

					{/* Action Buttons */}
					<View className="gap-3">
						{mockTool.status === "disponivel" && (
							<Button
								size="default"
								variant="default"
								onPress={() => handleAction("Emprestar")}
							>
								<View className="flex-row items-center gap-2">
									<MaterialIcons name="assignment" size={20} color="white" />
									<Text className="text-white font-semibold">
										Emprestar Ferramenta
									</Text>
								</View>
							</Button>
						)}

						{mockTool.status === "em_uso" && (
							<Button
								size="default"
								variant="default"
								onPress={() => handleAction("Devolver")}
							>
								<View className="flex-row items-center gap-2">
									<MaterialIcons
										name="assignment-return"
										size={20}
										color="white"
									/>
									<Text className="text-white font-semibold">
										Devolver Ferramenta
									</Text>
								</View>
							</Button>
						)}

						<Button
							size="default"
							variant="secondary"
							onPress={() => handleAction("Enviar para Manutenção")}
						>
							<View className="flex-row items-center gap-2">
								<MaterialIcons name="build-circle" size={20} color="#6b7280" />
								<Text className="font-semibold">Enviar para Manutenção</Text>
							</View>
						</Button>
					</View>

					{/* Bottom spacing */}
					<View className="h-4" />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
