import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Target, Users } from 'lucide-react';

const About = () => {
  useEffect(() => {
    document.title = 'About - The Tomorrows Team';
  }, []);

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Growth",
      description: "We believe every individual has the potential to become a confident communicator with the right guidance and practice."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Openness",
      description: "We create a safe space where every voice matters, every opinion is respected, and learning happens through diverse perspectives."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Respect",
      description: "We foster an inclusive community where differences are celebrated and constructive feedback helps everyone improve."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="About Us - The Tomorrows Team Leadership Development"
        description="Learn about The Tomorrows Team's mission to develop leadership skills through structured group discussions. Discover our story, values, and commitment to building tomorrow's leaders."
        keywords="about the tomorrows team, leadership development mission, group discussion platform, communication skills training, team building, professional development story"
        url="/about"
        type="website"
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About The Tomorrows Team
          </h1>
          <p className="text-xl text-muted-foreground">
            Building Confident Communicators for Tomorrow's World
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              At The Tomorrows Team, we believe the ability to speak clearly, think critically, and connect meaningfully is one of the most powerful tools a person can have. From acing interviews and leading team meetings to expressing ideas in classrooms, conferences, or casual conversations — communication shapes opportunities, relationships, and identities.
            </p>
            
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              But communication isn't just about talking. It's about being heard, being understood, and having the courage to stand up and say something that matters.
            </p>

            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              We're a community-led platform built to give that courage a voice. Here, individuals from all walks of life come together to practice, grow, and evolve — not just as speakers, but as active listeners, empathetic collaborators, and thoughtful leaders.
            </p>

            <p className="text-lg text-muted-foreground mb-4 leading-relaxed">
              Whether you're a:
            </p>

            <div className="text-lg text-muted-foreground mb-6 leading-relaxed space-y-2">
              <p>🌱 Student trying to crack your first GD</p>
              <p>👩‍💼 Professional looking to sharpen your presentation skills</p>
              <p>🎙️ Curious thinker who wants to challenge ideas through discussion</p>
              <p>🫂 Listener who learns best by observing conversations</p>
            </div>

            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              This is your space to show up, speak up, and stretch beyond your comfort zone — one discussion at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">
            Our Vision
          </h2>
          <div className="text-lg text-muted-foreground leading-relaxed space-y-6">
            <p>
              We envision a world where everyone feels confident using their voice — regardless of their background, accent, or level of experience.
            </p>
            
            <p>A world where:</p>
            
            <div className="space-y-2 ml-4">
              <p>Students in small towns and cities feel just as equipped to express ideas as those in metros</p>
              <p>Group discussions and public speaking don't cause anxiety but spark growth</p>
              <p>Communication is seen not as a talent for a few, but as a skill for all</p>
            </div>
            
            <p>
              At The Tomorrows Team, our vision is to build a global community of bold, thoughtful, and collaborative communicators — one conversation at a time.
            </p>
            
            <div className="text-center space-y-2 mt-8">
              <p className="font-semibold">We are not here to create performers.</p>
              <p className="font-semibold">We are here to empower thinkers who can speak with clarity, purpose, and heart.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Community Values
            </h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="feature-card text-center">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Founder's Note */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <Card className="feature-card">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
                Founder's Note
              </h2>
              <div className="relative">
                <div className="text-8xl text-black font-serif absolute -top-4 -left-2">❝</div>
                <div className="text-lg text-muted-foreground leading-relaxed space-y-4 pl-12">
                  <p className="ml-4">
                    When I started The Tomorrows Team, it wasn't just about launching a platform — it was about solving a problem I had seen over and over again.
                  </p>
                  <p>
                    In classrooms, offices, and even friend circles, I saw brilliant minds with incredible ideas… hesitant to speak. Not because they didn't know what to say, but because they weren't confident how to say it. And somewhere along the way, I realized this isn't just a communication issue — it's a confidence issue.
                  </p>
                  <p>
                    I've always believed that your voice shouldn't be held back by your background, your accent, or your fear of "sounding wrong." Everyone deserves a safe, non-judgmental space to speak, stumble, grow, and shine.
                  </p>
                  <p>
                    The Tomorrows Team was born from this belief — that when people are given a platform, a purpose, and a push, something incredible happens:
                  </p>
                  <div className="ml-4 space-y-1">
                    <p>They speak.</p>
                    <p>They listen.</p>
                    <p>They lead.</p>
                  </div>
                  <p>
                    What started as a weekend group discussion experiment has grown into a growing community of learners, listeners, and leaders from across the country — all working towards one shared goal: to become better communicators and better human beings.
                  </p>
                  <p>
                    We're just getting started — and I can't wait to see where your voice takes you.
                  </p>
                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="font-semibold">— Ayushi Aggarwal</p>
                    <p className="text-sm">Founder, The Tomorrows Team</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Impact So Far
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">30+</div>
              <div className="text-muted-foreground">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4+</div>
              <div className="text-muted-foreground">GDs Conducted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">1</div>
              <div className="text-muted-foreground">Community Taking Shape</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
