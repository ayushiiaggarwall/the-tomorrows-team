
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RegistrationResponse {
  success: boolean;
  registration_id: string;
  spots_left: number;
  total_capacity: number;
  message: string;
}

export const useAtomicGDRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      gdId, 
      userId, 
      registrationData 
    }: {
      gdId: string;
      userId: string;
      registrationData: {
        participantName: string;
        participantEmail: string;
        participantPhone: string;
        participantOccupation: string;
        participantOccupationOther?: string;
        studentInstitution?: string;
        studentYear?: string;
        professionalCompany?: string;
        professionalRole?: string;
        selfEmployedProfession?: string;
      };
    }) => {
      console.log('Attempting atomic registration for GD:', gdId, 'User:', userId);

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
        
        if (error.message.includes('GD_FULL')) {
          throw new Error('This group discussion is now full. Please try another session.');
        } else if (error.message.includes('ALREADY_REGISTERED')) {
          throw new Error('You are already registered for this group discussion.');
        } else if (error.message.includes('GD_NOT_FOUND')) {
          throw new Error('Group discussion not found or no longer active.');
        } else {
          throw new Error(error.message || 'Registration failed. Please try again.');
        }
      }

      console.log('Registration successful:', data);
      return data as RegistrationResponse;
    },
    onSuccess: (data: RegistrationResponse) => {
      console.log('Registration mutation successful:', data);
      
      // Show success toast with correct spots left count
      toast.success('Registration Successful!', {
        description: `You've been registered for the GD. ${data.spots_left} spots remaining.`,
        duration: 5000,
      });

      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
      queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
      queryClient.invalidateQueries({ queryKey: ['gd-registration-count'] });
      queryClient.invalidateQueries({ queryKey: ['user-registrations'] });
    },
    onError: (error: Error) => {
      console.error('Registration mutation failed:', error);
      
      toast.error('Registration Failed', {
        description: error.message,
        duration: 5000,
      });
    }
  });
};
