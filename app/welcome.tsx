import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, H2, P } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";

export default function WelcomeScreen() {
	const router = useRouter();
	const { colorScheme } = useColorScheme();
	const appIcon =
		colorScheme === "dark"
			? require("@/assets/icon.png")
			: require("@/assets/icon-dark.png");

	return (
		<SafeAreaView className="flex flex-1 bg-background p-4">
			<View className="flex flex-1 items-center justify-center gap-y-6 web:m-4">
				<View className="items-center gap-y-4">
					<Image source={appIcon} className="w-20 h-20 rounded-xl" />
					<View className="items-center gap-y-2">
						<H1 className="text-center text-4xl font-bold text-foreground">
							Canteiro
						</H1>
						<H2 className="text-center text-lg font-semibold text-primary">
							Gestão de Ferramentas
						</H2>
					</View>
				</View>

				<View className="items-center gap-y-3 px-4">
					<P className="text-center text-muted-foreground leading-relaxed">
						Controle total do inventário de ferramentas da sua obra
					</P>
					<View className="gap-y-2">
						<View className="flex-row items-center gap-x-2">
							<Text className="text-2xl">🔨</Text>
							<Text className="text-muted-foreground">
								Registre todas as ferramentas
							</Text>
						</View>
						<View className="flex-row items-center gap-x-2">
							<Text className="text-2xl">📍</Text>
							<Text className="text-muted-foreground">
								Rastreie localização e status
							</Text>
						</View>
						<View className="flex-row items-center gap-x-2">
							<Text className="text-2xl">👷</Text>
							<Text className="text-muted-foreground">
								Controle quem está usando
							</Text>
						</View>
						<View className="flex-row items-center gap-x-2">
							<Text className="text-2xl">⚙️</Text>
							<Text className="text-muted-foreground">Monitore manutenção</Text>
						</View>
					</View>
				</View>
			</View>

			<View className="flex flex-col gap-y-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={() => {
						router.push("/sign-up");
					}}
				>
					<Text className="text-white font-semibold">Criar conta</Text>
				</Button>
				<Button
					size="default"
					variant="secondary"
					onPress={() => {
						router.push("/sign-in");
					}}
				>
					<Text className="font-semibold">Já tenho conta</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
