
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
      // Attempting atomic registration for GD

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
        // Registration error
        
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

      // Registration successful
      
      // Type guard to ensure data is an object with the expected properties
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const response = data as Record<string, any>;
        if ('success' in response && 'spots_left' in response) {
          return response as RegistrationResponse;
        }
      }
      
      // Fallback in case the response structure is unexpected
      throw new Error('Invalid response format from registration');
    },
    onSuccess: (data: RegistrationResponse) => {
      // Registration mutation successful
      
      // Show success toast with correct spots left count
      toast.success('Registration Successful!', {
        description: `You've been registered for the GD. ${data.spots_left} spots remaining.`,
        duration: 5000,
        position: 'top-right',
        dismissible: true,
        closeButton: true,
      });

      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-gds-for-registration'] });
      queryClient.invalidateQueries({ queryKey: ['home-upcoming-gds'] });
      queryClient.invalidateQueries({ queryKey: ['gd-registration-count'] });
      queryClient.invalidateQueries({ queryKey: ['user-registrations'] });
    },
    onError: (error: Error) => {
      // Registration mutation failed
      
      toast.error('Registration Failed', {
        description: error.message,
        duration: 8000,
        position: 'top-right',
        dismissible: true,
        closeButton: true,
      });
    }
  });
};
