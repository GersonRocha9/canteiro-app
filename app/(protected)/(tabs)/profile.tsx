import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2 } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { useProfile } from "@/hooks/useProfile";

interface MenuItemProps {
	icon: keyof typeof MaterialIcons.glyphMap;
	title: string;
	subtitle?: string;
	onPress: () => void;
	showArrow?: boolean;
	color?: string;
}

function MenuItem({
	icon,
	title,
	subtitle,
	onPress,
	showArrow = true,
	color = "#6b7280",
}: MenuItemProps) {
	return (
		<TouchableOpacity
			onPress={onPress}
			className="flex-row items-center p-4 bg-card rounded-lg border border-border"
		>
			<View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-4">
				<MaterialIcons name={icon} size={24} color={color} />
			</View>
			<View className="flex-1">
				<Text className="font-medium text-foreground">{title}</Text>
				{subtitle && (
					<Text className="text-sm text-muted-foreground mt-1">{subtitle}</Text>
				)}
			</View>
			{showArrow && (
				<MaterialIcons name="chevron-right" size={24} color="#6b7280" />
			)}
		</TouchableOpacity>
	);
}

export default function Profile() {
	const { signOut, session } = useAuth();
	const { profile, loading, error, getUserStats } = useProfile();
	const [stats, setStats] = useState({ toolsInUse: 0, totalReturns: 0 });

	useEffect(() => {
		if (profile) {
			getUserStats().then(setStats);
		}
	}, [profile, getUserStats]);

	const handleSignOut = () => {
		Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
			{
				text: "Cancelar",
				style: "cancel",
			},
			{
				text: "Sair",
				style: "destructive",
				onPress: async () => {
					try {
						await signOut();
					} catch (error) {
						console.error("Erro ao sair:", error);
					}
				},
			},
		]);
	};

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center">
					<Text className="text-muted-foreground">Carregando perfil...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (error || !profile) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 items-center justify-center p-4">
					<MaterialIcons name="error-outline" size={48} color="#ef4444" />
					<Text className="text-red-600 text-center mt-4">
						{error || "Erro ao carregar perfil"}
					</Text>
					<Button
						onPress={() => {
							// Força um refresh do perfil
							if (profile) {
								getUserStats().then(setStats);
							}
						}}
						className="mt-4"
						variant="outline"
					>
						<Text>Tentar novamente</Text>
					</Button>
				</View>
			</SafeAreaView>
		);
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("pt-BR", {
			month: "long",
			year: "numeric",
		});
	};

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="p-4 gap-6">
					{/* Header */}
					<H1 className="text-2xl font-bold text-foreground">Perfil</H1>

					{/* User Info Card */}
					<View className="bg-card rounded-lg p-6 border border-border">
						<View className="items-center gap-4">
							<View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center">
								<MaterialIcons name="person" size={40} color="#3b82f6" />
							</View>
							<View className="items-center gap-1">
								<H2 className="text-xl font-bold text-foreground">
									{profile.full_name}
								</H2>
								<Text className="text-muted-foreground capitalize">
									{profile.role}
								</Text>
								<Text className="text-sm text-muted-foreground">
									{profile.company?.name || "Empresa não informada"}
								</Text>
							</View>
						</View>
					</View>

					{/* Personal Info */}
					<View className="gap-4">
						<H2 className="text-lg font-semibold text-foreground">
							Informações Pessoais
						</H2>
						<View className="gap-3">
							<MenuItem
								icon="email"
								title="Email"
								subtitle={session?.user?.email || "Não informado"}
								onPress={() => {}}
								showArrow={false}
							/>
							<MenuItem
								icon="badge"
								title="CPF"
								subtitle={profile.cpf}
								onPress={() => {}}
								showArrow={false}
							/>
							<MenuItem
								icon="work"
								title="Cargo/Função"
								subtitle={profile.role}
								onPress={() => {}}
								showArrow={false}
							/>
							<MenuItem
								icon="business"
								title="Empresa"
								subtitle={profile.company?.name || "Não informada"}
								onPress={() => {}}
								showArrow={false}
							/>
							{profile.phone && (
								<MenuItem
									icon="phone"
									title="Telefone"
									subtitle={profile.phone}
									onPress={() => {}}
									showArrow={false}
								/>
							)}
						</View>
					</View>

					{/* App Settings */}
					<View className="gap-4">
						<H2 className="text-lg font-semibold text-foreground">
							Configurações
						</H2>
						<View className="gap-3">
							<MenuItem
								icon="notifications"
								title="Notificações"
								subtitle="Gerenciar notificações do app"
								onPress={() => router.push("/(protected)/modal")}
							/>
							<MenuItem
								icon="help"
								title="Ajuda e Suporte"
								subtitle="Central de ajuda e FAQ"
								onPress={() => router.push("/(protected)/modal")}
							/>
							<MenuItem
								icon="info"
								title="Sobre o App"
								subtitle="Versão 1.0.0"
								onPress={() => router.push("/(protected)/modal")}
							/>
						</View>
					</View>

					{/* Statistics */}
					<View className="gap-4">
						<H2 className="text-lg font-semibold text-foreground">
							Suas Estatísticas
						</H2>
						<View className="flex-row gap-3">
							<View className="flex-1 bg-card rounded-lg p-4 border border-border items-center">
								<MaterialIcons name="build" size={32} color="#3b82f6" />
								<Text className="text-2xl font-bold text-foreground mt-2">
									{stats.toolsInUse}
								</Text>
								<Text className="text-sm text-muted-foreground text-center">
									Ferramentas em uso
								</Text>
							</View>
							<View className="flex-1 bg-card rounded-lg p-4 border border-border items-center">
								<MaterialIcons
									name="assignment-return"
									size={32}
									color="#10b981"
								/>
								<Text className="text-2xl font-bold text-foreground mt-2">
									{stats.totalReturns}
								</Text>
								<Text className="text-sm text-muted-foreground text-center">
									Devoluções feitas
								</Text>
							</View>
						</View>
					</View>

					{/* Sign Out */}
					<View className="gap-4 pt-4">
						<Button
							size="default"
							variant="secondary"
							onPress={handleSignOut}
							className="bg-red-50 border-red-200"
						>
							<View className="flex-row items-center gap-2">
								<MaterialIcons name="logout" size={20} color="#ef4444" />
								<Text className="font-semibold text-red-600">
									Sair da conta
								</Text>
							</View>
						</Button>
					</View>

					{/* Bottom Info */}
					<View className="items-center pt-4">
						<Text className="text-xs text-muted-foreground">
							Membro desde {formatDate(profile.created_at)}
						</Text>
						<Text className="text-xs text-muted-foreground mt-1">
							Canteiro v1.0.0
						</Text>
					</View>

					{/* Bottom spacing */}
					<View className="h-4" />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
