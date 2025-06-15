import { MaterialIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Alert, ScrollView, View } from "react-native";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1, P } from "@/components/ui/typography";
import { useProfile } from "@/hooks/useProfile";
import { useTools } from "@/hooks/useTools";

const formSchema = z.object({
	name: z
		.string()
		.min(2, "O nome deve ter pelo menos 2 caracteres.")
		.max(100, "O nome deve ter menos de 100 caracteres."),
	description: z
		.string()
		.min(5, "A descrição deve ter pelo menos 5 caracteres.")
		.max(500, "A descrição deve ter menos de 500 caracteres."),
	serialNumber: z
		.string()
		.min(3, "O número de série deve ter pelo menos 3 caracteres.")
		.max(50, "O número de série deve ter menos de 50 caracteres.")
		.optional()
		.or(z.literal("")),
	brand: z
		.string()
		.max(50, "A marca deve ter menos de 50 caracteres.")
		.optional()
		.or(z.literal("")),
	model: z
		.string()
		.max(50, "O modelo deve ter menos de 50 caracteres.")
		.optional()
		.or(z.literal("")),
	location: z
		.string()
		.min(2, "A localização deve ter pelo menos 2 caracteres.")
		.max(100, "A localização deve ter menos de 100 caracteres."),
	category: z
		.string()
		.min(2, "A categoria deve ter pelo menos 2 caracteres.")
		.max(50, "A categoria deve ter menos de 50 caracteres."),
	observations: z
		.string()
		.max(1000, "As observações devem ter menos de 1000 caracteres.")
		.optional()
		.or(z.literal("")),
});

export default function AddTool() {
	const { createTool } = useTools();
	const { profile } = useProfile();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			serialNumber: "",
			brand: "",
			model: "",
			location: "",
			category: "",
			observations: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		if (!profile?.company_id || !profile?.id) {
			Alert.alert("Erro", "Perfil de usuário não encontrado.");
			return;
		}

		try {
			const toolData = {
				name: data.name,
				description: data.description || null,
				serial_number: data.serialNumber || null,
				brand: data.brand || null,
				model: data.model || null,
				location: data.location,
				observations: data.observations || null,
				company_id: profile.company_id,
				created_by: profile.id,
				status: "disponivel" as const,
			};

			const { data: newTool, error } = await createTool(toolData);

			if (error) {
				throw new Error(error);
			}

			Alert.alert("Sucesso!", "Ferramenta cadastrada com sucesso.", [
				{
					text: "Ver Ferramenta",
					onPress: () => {
						form.reset();
						router.push({
							pathname: "/(protected)/tool-details",
							params: { toolId: newTool?.id },
						});
					},
				},
				{
					text: "Cadastrar Outra",
					onPress: () => {
						form.reset();
					},
				},
				{
					text: "Voltar",
					style: "cancel",
					onPress: () => {
						form.reset();
						router.back();
					},
				},
			]);
		} catch (error: Error | any) {
			console.error("Error creating tool:", error);
			Alert.alert(
				"Erro",
				error.message || "Não foi possível cadastrar a ferramenta.",
			);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
				<View className="p-4 gap-6">
					{/* Header */}
					<View className="flex-row items-center gap-4">
						<Button size="sm" variant="ghost" onPress={() => router.back()}>
							<MaterialIcons name="arrow-back" size={24} color="#6b7280" />
						</Button>
						<View className="flex-1">
							<H1 className="text-2xl font-bold text-foreground">
								Nova Ferramenta
							</H1>
							<P className="text-muted-foreground">
								Adicione uma nova ferramenta ao inventário
							</P>
						</View>
					</View>

					{/* Form */}
					<View className="gap-4">
						<Form {...form}>
							<View className="gap-4">
								<FormField
									control={form.control}
									name="name"
									render={({ field }) => (
										<FormInput
											label="Nome da ferramenta *"
											placeholder="Ex: Furadeira de Impacto"
											autoCapitalize="words"
											autoCorrect={false}
											{...field}
										/>
									)}
								/>

								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormInput
											label="Descrição *"
											placeholder="Ex: Furadeira de impacto Black & Decker 650W com kit completo de brocas"
											autoCapitalize="sentences"
											multiline
											numberOfLines={3}
											{...field}
										/>
									)}
								/>

								<View className="flex-row gap-3">
									<View className="flex-1">
										<FormField
											control={form.control}
											name="brand"
											render={({ field }) => (
												<FormInput
													label="Marca"
													placeholder="Ex: Bosch, DeWalt"
													autoCapitalize="words"
													autoCorrect={false}
													{...field}
												/>
											)}
										/>
									</View>
									<View className="flex-1">
										<FormField
											control={form.control}
											name="model"
											render={({ field }) => (
												<FormInput
													label="Modelo"
													placeholder="Ex: HD650K"
													autoCapitalize="characters"
													autoCorrect={false}
													{...field}
												/>
											)}
										/>
									</View>
								</View>

								<FormField
									control={form.control}
									name="serialNumber"
									render={({ field }) => (
										<FormInput
											label="Número de série"
											placeholder="Ex: BD-FI-001"
											autoCapitalize="characters"
											autoCorrect={false}
											{...field}
										/>
									)}
								/>

								<FormField
									control={form.control}
									name="category"
									render={({ field }) => (
										<FormInput
											label="Categoria *"
											placeholder="Ex: Ferramentas Elétricas, Manuais, Medição"
											autoCapitalize="words"
											autoCorrect={false}
											{...field}
										/>
									)}
								/>

								<FormField
									control={form.control}
									name="location"
									render={({ field }) => (
										<FormInput
											label="Localização inicial *"
											placeholder="Ex: Almoxarifado A - Prateleira 1"
											autoCapitalize="words"
											autoCorrect={false}
											{...field}
										/>
									)}
								/>

								<FormField
									control={form.control}
									name="observations"
									render={({ field }) => (
										<FormInput
											label="Observações"
											placeholder="Informações adicionais sobre a ferramenta"
											autoCapitalize="sentences"
											autoCorrect={true}
											multiline
											numberOfLines={4}
											{...field}
										/>
									)}
								/>
							</View>
						</Form>

						{/* Required fields note */}
						<View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
							<View className="flex-row items-center gap-2 mb-1">
								<MaterialIcons name="info" size={16} color="#3b82f6" />
								<Text className="text-blue-800 font-medium text-sm">
									Campos obrigatórios
								</Text>
							</View>
							<Text className="text-blue-700 text-xs">
								Os campos marcados com * são obrigatórios para o cadastro.
							</Text>
						</View>
					</View>

					{/* Action Buttons */}
					<View className="gap-3">
						<Button
							size="default"
							variant="default"
							onPress={form.handleSubmit(onSubmit)}
							disabled={form.formState.isSubmitting}
						>
							{form.formState.isSubmitting ? (
								<View className="flex-row items-center gap-2">
									<ActivityIndicator size="small" color="white" />
									<Text className="text-white font-semibold">Salvando...</Text>
								</View>
							) : (
								<View className="flex-row items-center gap-2">
									<MaterialIcons name="save" size={20} color="white" />
									<Text className="text-white font-semibold">
										Cadastrar Ferramenta
									</Text>
								</View>
							)}
						</Button>

						<Button
							size="default"
							variant="ghost"
							onPress={() => router.back()}
						>
							<Text className="text-muted-foreground font-semibold">
								Cancelar
							</Text>
						</Button>
					</View>

					{/* Bottom spacing for keyboard */}
					<View className="h-8" />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
