import { useState } from 'react';
import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Youtube, Instagram, Linkedin, Mail, MessageCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    topic: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us - The Tomorrows Team';
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Call Supabase Edge Function to send email
      const response = await fetch('https://wusbwaddlufqjltabtnp.supabase.co/functions/v1/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1c2J3YWRkbHVmcWpsdGFidG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODY5MDMsImV4cCI6MjA2NDk2MjkwM30.yd7MFH8G7FyNs-pi28SHiVRn4BVGx1xY7RQo5gHVYWU'}`,
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          topic: formData.topic || 'General Inquiry',
          message: formData.message
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      toast.success('Thanks! We\'ll get back to you within 24 hours.');
      
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        topic: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Contact Us - Get in Touch with The Tomorrows Team"
        description="Contact The Tomorrows Team for questions about group discussions, partnerships, or support. We're here to help you develop your leadership and communication skills."
        keywords="contact the tomorrows team, group discussion support, leadership development contact, communication skills help, partnership inquiries"
        url="/contact"
        type="website"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Let's Connect
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Got a question, feedback, or partnership idea? We'd love to hear from you.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="feature-card h-full">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Select value={formData.topic} onValueChange={(value) => handleInputChange('topic', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="gd-feedback">GD Feedback</SelectItem>
                        <SelectItem value="collaboration">Collaboration</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      className="mt-1"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6 flex flex-col">
            {/* Contact Details */}
            <Card className="feature-card flex-1">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a 
                      href="mailto:hello@thetomorrowsteam.com" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      hello@thetomorrowsteam.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <a 
                      href="https://wa.me/917973195812" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      +91-7973195812
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">Based in India, working remotely</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="feature-card flex-1">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-3">
                  <a 
                    href="https://youtube.com/@thetomorrowsteam?si=NKxIUwdc3RJNLNuA" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors group"
                  >
                    <Youtube className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-medium text-red-700">YouTube</p>
                      <p className="text-sm text-red-600">Watch our GD sessions</p>
                    </div>
                  </a>

                  <a 
                    href="https://www.instagram.com/thetomorrowsteam_?igsh=NXhqd3VodXMzcXk1&utm_source=qr" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors group"
                  >
                    <Instagram className="w-6 h-6 text-pink-600" />
                    <div>
                      <p className="font-medium text-pink-700">Instagram</p>
                      <p className="text-sm text-pink-600">Daily tips & updates</p>
                    </div>
                  </a>

                  <a 
                    href="https://www.linkedin.com/company/107558545/admin/dashboard/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group"
                  >
                    <Linkedin className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-700">LinkedIn</p>
                      <p className="text-sm text-blue-600">Professional network</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Contact;
