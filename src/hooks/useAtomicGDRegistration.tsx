
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RegistrationData {
  participantName: string;
  participantEmail: string;
  participantPhone: string;
  participantOccupation?: string;
  participantOccupationOther?: string;
  studentInstitution?: string;
  studentYear?: string;
  professionalCompany?: string;
  professionalRole?: string;
  selfEmployedProfession?: string;
}

interface RegistrationResponse {
  success: boolean;
  registration_id: string;
  spots_left: number;
  total_capacity: number;
  message: string;
}

export const useAtomicGDRegistration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const registerForGD = useMutation({
    mutationFn: async ({ 
      gdId, 
      userId, 
      registrationData 
    }: { 
      gdId: string; 
      userId: string; 
      registrationData: RegistrationData;
    }) => {
      console.log('Attempting atomic registration for GD:', gdId, 'User:', userId);
      
      // First check if user has an active (non-cancelled) registration
      const { data: existingReg, error: checkError } = await supabase
        .from('gd_registrations')
        .select('id, cancelled_at')
        .eq('gd_id', gdId)
        .eq('user_id', userId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing registration:', checkError);
        throw checkError;
      }

      // If there's an active registration (not cancelled), prevent duplicate
      if (existingReg && !existingReg.cancelled_at) {
        throw new Error('ALREADY_REGISTERED: You are already registered for this GD');
      }

      const { data, error } = await supabase.rpc('register_for_gd_atomic', {
        p_gd_id: gdId,
        p_user_id: userId,
        p_participant_name: registrationData.participantName,
        p_participant_email: registrationData.participantEmail,
        p_participant_phone: registrationData.participantPhone,
        p_participant_occupation: registrationData.participantOccupation,
        p_participant_occupation_other: registrationData.participantOccupationOther,
        p_student_institution: registrationData.studentInstitution,
        p_student_year: registrationData.studentYear,
        p_professional_company: registrationData.professionalCompany,
        p_professional_role: registrationData.professionalRole,
        p_self_employed_profession: registrationData.selfEmployedProfession
      });

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }

      console.log('Registration successful:', data);
      return data as unknown as RegistrationResponse;
    },
    onSuccess: (data) => {
      const message = data?.message || 'Registration successful';
      const spotsLeft = data?.spots_left || 0;
      
      toast({
        title: "Registration Successful! 🎉",
        description: `${message}. ${spotsLeft} spots remaining.`,
      });
      
      // Invalidate and refetch all related queries
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
      queryClient.invalidateQueries({ queryKey: ['gd-registration-count'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
      queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
    },
    onError: (error: any) => {
      console.error('Registration mutation error:', error);
      
      if (error.message?.includes('ALREADY_REGISTERED')) {
        toast({
          title: "Already Registered",
          description: "You are already registered for this group discussion.",
          variant: "destructive"
        });
      } else if (error.message?.includes('GD_FULL')) {
        toast({
          title: "Group Discussion Full",
          description: "This session is now full. Please try another session.",
          variant: "destructive"
        });
      } else if (error.message?.includes('GD_NOT_FOUND')) {
        toast({
          title: "Session Not Found",
          description: "This group discussion session is no longer available.",
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

  return registerForGD;
};
