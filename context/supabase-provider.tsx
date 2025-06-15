import { SplashScreen, useRouter } from "expo-router";
import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";

import { Session } from "@supabase/supabase-js";

import { supabase } from "@/config/supabase";

SplashScreen.preventAutoHideAsync();

type SignUpData = {
	email: string;
	password: string;
	fullName: string;
	cpf: string;
	role: string;
	companyCode: string;
};

type AuthState = {
	initialized: boolean;
	session: Session | null;
	signUp: (data: SignUpData) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
	initialized: false,
	session: null,
	signUp: async () => {},
	signIn: async () => {},
	signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: PropsWithChildren) {
	const [initialized, setInitialized] = useState(false);
	const [session, setSession] = useState<Session | null>(null);
	const router = useRouter();

	const createProfileManually = async (userId: string, data: SignUpData) => {
		try {
			// Primeiro verifica se o perfil já existe
			const { data: existingProfile } = await supabase
				.from("profiles")
				.select("id")
				.eq("id", userId)
				.single();

			if (existingProfile) {
				console.log("Profile already exists, skipping creation");
				return;
			}

			// Aguarda um pouco para dar tempo do trigger automático executar
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Verifica novamente se o perfil foi criado pelo trigger
			const { data: profileAfterWait } = await supabase
				.from("profiles")
				.select("id")
				.eq("id", userId)
				.single();

			if (profileAfterWait) {
				console.log(
					"Profile was created by trigger, no manual creation needed",
				);
				return;
			}

			// Se ainda não existe, cria manualmente
			const { error } = await supabase.rpc("create_profile_for_user", {
				user_id: userId,
				user_email: data.email,
				full_name: data.fullName,
				cpf: data.cpf,
				role: data.role,
				company_code: data.companyCode,
				phone: null,
			});

			if (error && error.code !== "23505") {
				// Ignora erro de duplicação
				console.error("Error creating profile manually:", error);
				// Tenta inserção direta se a função RPC falhar
				await createProfileDirectly(userId, data);
			} else if (error?.code === "23505") {
				console.log("Profile already exists (duplicate key), this is expected");
			} else {
				console.log("Profile created successfully via RPC");
			}
		} catch (error) {
			console.error("Error in manual profile creation:", error);
			// Fallback para inserção direta apenas se não for erro de duplicação
			if (
				error &&
				typeof error === "object" &&
				"code" in error &&
				error.code !== "23505"
			) {
				await createProfileDirectly(userId, data);
			}
		}
	};

	const mapRoleToValid = (inputRole: string): string => {
		const role = inputRole.toLowerCase();
		if (role.includes("admin")) return "admin";
		if (role.includes("encarregado")) return "encarregado";
		if (role.includes("mestre")) return "mestre_obras";
		if (role.includes("almoxarife")) return "almoxarife";
		if (role.includes("desenvolvedor")) return "admin";
		if (role.includes("gerente")) return "encarregado";
		if (role.includes("supervisor")) return "encarregado";
		return "operario";
	};

	const createProfileDirectly = async (userId: string, data: SignUpData) => {
		try {
			// Verifica se o perfil já existe antes de tentar criar
			const { data: existingProfile } = await supabase
				.from("profiles")
				.select("id")
				.eq("id", userId)
				.single();

			if (existingProfile) {
				console.log("Profile already exists, skipping direct creation");
				return;
			}

			// Mapeia o role para um valor válido
			const mappedRole = mapRoleToValid(data.role);

			// Busca a empresa pelo código
			let { data: company } = await supabase
				.from("companies")
				.select("id")
				.eq("code", data.companyCode.toUpperCase())
				.eq("is_active", true)
				.single();

			// Se não encontrar, usa a empresa padrão
			if (!company) {
				const { data: defaultCompany } = await supabase
					.from("companies")
					.select("id")
					.eq("name", "Construtora ABC Ltda")
					.single();

				company = defaultCompany;
			}

			// Insere o perfil diretamente
			const { error: profileError } = await supabase.from("profiles").insert({
				id: userId,
				full_name: data.fullName,
				cpf: data.cpf,
				role: mappedRole,
				company_id: company?.id || "550e8400-e29b-41d4-a716-446655440000",
				phone: null,
				is_active: true,
			});

			if (profileError && profileError.code !== "23505") {
				console.error("Error creating profile directly:", profileError);
			} else if (profileError?.code === "23505") {
				console.log("Profile already exists (duplicate key), this is expected");
			} else {
				console.log("Profile created successfully via direct insert");
			}
		} catch (error) {
			console.error("Error in direct profile creation:", error);
		}
	};

	const signUp = async (data: SignUpData) => {
		const { data: authData, error } = await supabase.auth.signUp({
			email: data.email,
			password: data.password,
			options: {
				data: {
					full_name: data.fullName,
					cpf: data.cpf,
					role: data.role,
					company_code: data.companyCode,
				},
			},
		});

		if (error) {
			console.error("Error signing up:", error);
			throw error;
		}

		if (authData.user) {
			console.log("User signed up:", authData.user);

			// Cria o perfil manualmente após o signup
			await createProfileManually(authData.user.id, data);

			if (authData.session) {
				setSession(authData.session);
			}
		} else {
			console.log("No user returned from sign up");
		}
	};

	const signIn = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error("Error signing in:", error);
			throw error;
		}

		if (data.session) {
			setSession(data.session);
			console.log("User signed in:", data.user);
		} else {
			console.log("No user returned from sign in");
		}
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();

		if (error) {
			console.error("Error signing out:", error);
			return;
		} else {
			console.log("User signed out");
		}
	};

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		setInitialized(true);
	}, []);

	useEffect(() => {
		if (initialized) {
			SplashScreen.hideAsync();
			if (session) {
				router.replace("/");
			} else {
				router.replace("/welcome");
			}
		}
		// eslint-disable-next-line
	}, [initialized, session]);

	return (
		<AuthContext.Provider
			value={{
				initialized,
				session,
				signUp,
				signIn,
				signOut,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
