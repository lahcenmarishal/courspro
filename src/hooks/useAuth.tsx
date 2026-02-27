import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'admin' | 'teacher' | 'student';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, role: AppRole, city?: string, phone?: string, selectedPlan?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching role:', error);
        return null;
      }

      if (!data) return null;
      if (data.role === 'student' && data.status !== 'approved') return null;

      return data.role as AppRole;
    } catch (error) {
      console.error('Error fetching role:', error);
      return null;
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        fetchUserRole(nextSession.user.id)
          .then(setRole)
          .finally(() => setLoading(false));
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);

      if (existingSession?.user) {
        fetchUserRole(existingSession.user.id)
          .then(setRole)
          .finally(() => setLoading(false));
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    userRole: AppRole,
    city?: string,
    phone?: string,
    selectedPlan?: string,
  ) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: firstName,
            last_name: lastName,
            city,
            phone,
            selected_plan: selectedPlan,
          },
        },
      });

      if (error) return { error };

      if (data.user) {
        let roleCreated = false;

        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: userRole, status: 'pending' });

        if (!roleError) {
          roleCreated = true;
        } else {
          console.error('Error setting role from client flow:', roleError);
        }

        if (userRole === 'student') {
          const { error: registrationError } = await supabase.functions.invoke('complete-student-registration', {
            body: {
              user_id: data.user.id,
              first_name: firstName,
              last_name: lastName,
              email,
              city,
              phone,
              selected_plan: selectedPlan,
            },
          });

          if (!registrationError) {
            roleCreated = true;
          } else {
            console.error('Error completing student registration:', registrationError);
          }

          await supabase.auth.signOut();
        }

        if (!roleCreated) {
          console.error('No role could be created during signup.');
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      role,
      loading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
