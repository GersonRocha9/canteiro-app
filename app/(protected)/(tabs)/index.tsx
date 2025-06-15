import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, P } from "@/components/ui/typography";
import { useDashboard } from "@/hooks/useDashboard";
import { useProfile } from "@/hooks/useProfile";

const actionIcons = {
	emprestado: "build" as const,
	devolvido: "assignment-return" as const,
	manutencao_enviado: "build-circle" as const,
	manutencao_retornado: "check-circle" as const,
	transferido: "swap-horiz" as const,
	descartado: "delete" as const,
};

const actionLabels = {
	emprestado: "emprestada",
	devolvido: "devolvido",
	manutencao_enviado: "enviada para manutenção",
	manutencao_retornado: "retornada da manutenção",
	transferido: "transferida",
	descartado: "descartada",
};

function formatTimeAgo(dateString: string): string {
	const date = new Date(dateString);
	const now = new Date();
	const diffInMinutes = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60),
	);

	if (diffInMinutes < 60) {
		return `há ${diffInMinutes} min`;
	} else if (diffInMinutes < 1440) {
		const hours = Math.floor(diffInMinutes / 60);
		return `há ${hours}h`;
	} else {
		const days = Math.floor(diffInMinutes / 1440);
		return `há ${days} dia${days > 1 ? "s" : ""}`;
	}
}

interface StatsCardProps {
	title: string;
	value: number;
	icon: keyof typeof MaterialIcons.glyphMap;
	color: string;
	onPress?: () => void;
	loading?: boolean;
}

function StatsCard({
	title,
	value,
	icon,
	color,
	onPress,
	loading,
}: StatsCardProps) {
	return (
		<TouchableOpacity
			onPress={onPress}
			className="flex-1 bg-card rounded-lg p-4 border border-border shadow-sm"
			disabled={loading}
		>
			<View className="flex-row items-center justify-between mb-2">
				<MaterialIcons name={icon} size={24} color={color} />
				<Text
					className={`text-2xl font-bold ${color === "#ef4444" ? "text-red-500" : color === "#f59e0b" ? "text-amber-500" : color === "#10b981" ? "text-green-500" : "text-primary"}`}
				>
					{loading ? "..." : value}
				</Text>
			</View>
			<Text className="text-sm text-muted-foreground font-medium">{title}</Text>
		</TouchableOpacity>
	);
}

interface ActivityItemProps {
	action: string;
	toolName: string;
	userName: string;
	createdAt: string;
	icon: keyof typeof MaterialIcons.glyphMap;
}

function ActivityItem({
	action,
	toolName,
	userName,
	createdAt,
	icon,
}: ActivityItemProps) {
	return (
		<View className="flex-row items-center p-3 bg-card rounded-lg border border-border">
			<View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
				<MaterialIcons name={icon} size={20} color="#3b82f6" />
			</View>
			<View className="flex-1">
				<Text className="font-medium text-foreground">
					{toolName}{" "}
					{actionLabels[action as keyof typeof actionLabels] || action}
				</Text>
				<Text className="text-sm text-muted-foreground">
					{userName} • {formatTimeAgo(createdAt)}
				</Text>
			</View>
		</View>
	);
}

export default function Dashboard() {
	const { stats, loading, error, refreshing, refresh } = useDashboard();
	const { profile } = useProfile();

	const userName = profile?.full_name?.split(" ")[0] || "Usuário";

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView
				className="flex-1"
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={refresh} />
				}
			>
				<View className="p-4 gap-6">
					{/* Header */}
					<View className="gap-2">
						<H1 className="text-2xl font-bold text-foreground">
							Olá, {userName}! 👋
						</H1>
						<P className="text-muted-foreground">
							Bem-vindo ao painel de controle do Canteiro
						</P>
					</View>

					{/* Error State */}
					{error && (
						<View className="bg-red-50 border border-red-200 rounded-lg p-4">
							<Text className="text-red-800 text-sm">{error}</Text>
						</View>
					)}

					{/* Stats Cards */}
					<View className="gap-4">
						<H2 className="text-lg font-semibold text-foreground">
							Resumo Geral
						</H2>
						<View className="flex-row gap-3">
							<StatsCard
								title="Total"
								value={stats.total_tools}
								icon="build"
								color="#3b82f6"
								loading={loading}
								onPress={() => router.push("/(protected)/(tabs)/tools")}
							/>
							<StatsCard
								title="Disponíveis"
								value={stats.available_tools}
								icon="check-circle"
								color="#10b981"
								loading={loading}
								onPress={() =>
									router.push("/(protected)/(tabs)/tools?filter=available")
								}
							/>
						</View>
						<View className="flex-row gap-3">
							<StatsCard
								title="Em Uso"
								value={stats.in_use_tools}
								icon="schedule"
								color="#f59e0b"
								loading={loading}
								onPress={() =>
									router.push("/(protected)/(tabs)/tools?filter=in-use")
								}
							/>
							<StatsCard
								title="Manutenção"
								value={stats.maintenance_tools}
								icon="build-circle"
								color="#ef4444"
								loading={loading}
								onPress={() =>
									router.push("/(protected)/(tabs)/tools?filter=maintenance")
								}
							/>
						</View>
					</View>

					{/* Quick Actions */}
					<View className="gap-4">
						<H2 className="text-lg font-semibold text-foreground">
							Ações Rápidas
						</H2>
						<View className="gap-3">
							<Button
								variant="default"
								size="default"
								onPress={() => router.push("/(protected)/add-tool")}
								className="w-full"
							>
								<View className="flex-row items-center justify-center gap-3">
									<MaterialIcons name="add" size={24} color="white" />
									<Text className="text-white font-semibold text-base">
										Nova Ferramenta
									</Text>
								</View>
							</Button>
						</View>
					</View>

					{/* Recent Activities */}
					<View className="gap-4">
						<View className="flex-row items-center justify-between">
							<H2 className="text-lg font-semibold text-foreground">
								Atividades Recentes
							</H2>
							<TouchableOpacity
								onPress={() => router.push("/(protected)/activities")}
								className="flex-row items-center"
							>
								<Text className="text-primary text-sm font-medium mr-1">
									Ver todas
								</Text>
								<MaterialIcons name="chevron-right" size={16} color="#3b82f6" />
							</TouchableOpacity>
						</View>
						<View className="gap-3">
							{loading ? (
								Array.from({ length: 3 }).map((_, index) => (
									<View
										key={index}
										className="flex-row items-center p-3 bg-card rounded-lg border border-border"
									>
										<View className="w-10 h-10 rounded-full bg-gray-200 mr-3" />
										<View className="flex-1 gap-1">
											<View className="h-4 bg-gray-200 rounded w-3/4" />
											<View className="h-3 bg-gray-200 rounded w-1/2" />
										</View>
									</View>
								))
							) : stats.recent_activities.length > 0 ? (
								stats.recent_activities
									.slice(0, 5)
									.map((activity) => (
										<ActivityItem
											key={activity.id}
											action={activity.action}
											toolName={activity.tool?.name || "Ferramenta"}
											userName={activity.user?.full_name || "Usuário"}
											createdAt={activity.created_at}
											icon={
												actionIcons[
													activity.action as keyof typeof actionIcons
												] || "build"
											}
										/>
									))
							) : (
								<View className="p-6 items-center">
									<MaterialIcons name="inbox" size={48} color="#9ca3af" />
									<Text className="text-muted-foreground text-center mt-2">
										Nenhuma atividade recente
									</Text>
								</View>
							)}
						</View>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
