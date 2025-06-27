
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RegistrationData {
  gdId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  occupationOther?: string;
  studentInstitution?: string;
  studentYear?: string;
  professionalCompany?: string;
  professionalRole?: string;
  selfEmployedProfession?: string;
}

export const useAtomicGDRegistration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (registrationData: RegistrationData) => {
      console.log('Starting atomic registration for GD:', registrationData.gdId);

      // Use a database transaction to ensure atomicity
      const { data, error } = await supabase.rpc('register_for_gd_atomic', {
        p_gd_id: registrationData.gdId,
        p_user_id: registrationData.userId,
        p_participant_name: registrationData.name,
        p_participant_email: registrationData.email,
        p_participant_phone: registrationData.phone,
        p_participant_occupation: registrationData.occupation,
        p_participant_occupation_other: registrationData.occupationOther || null,
        p_student_institution: registrationData.studentInstitution || null,
        p_student_year: registrationData.studentYear || null,
        p_professional_company: registrationData.professionalCompany || null,
        p_professional_role: registrationData.professionalRole || null,
        p_self_employed_profession: registrationData.selfEmployedProfession || null
      });

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }

      console.log('Registration successful:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Registration Successful!",
        description: "You have been registered for the group discussion.",
      });
      
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['gd-registration-count'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
      queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
      
      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ['gd-registration-count', variables.gdId] });
    },
    onError: (error: any) => {
      console.error('Registration mutation error:', error);
      
      if (error.message?.includes('GD_FULL')) {
        toast({
          title: "Session Full",
          description: "This group discussion is now full. Please try another session.",
          variant: "destructive"
        });
      } else if (error.message?.includes('ALREADY_REGISTERED')) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this group discussion.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration Failed",
          description: error.message || "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  return registerMutation;
};
