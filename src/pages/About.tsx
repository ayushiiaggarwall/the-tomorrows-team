import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
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
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            About The Tomorrows Team
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Building confident communicators for tomorrow's world
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              We're a community-led platform where individuals grow their confidence, improve articulation, and learn to express ideas effectively. Whether you're preparing for an interview, want to share your opinion on global issues, or just want to learn by listening — this is your space.
            </p>
            
            <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
              Our mission is simple: to democratize access to quality communication training. We believe that effective communication is not a privilege but a skill that everyone deserves to develop, regardless of their background or current ability level.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Our Vision
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            To create a generation of confident communicators who can articulate their thoughts clearly, listen actively, and engage in meaningful conversations that drive positive change in society.
          </p>
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
              <div className="text-lg text-muted-foreground leading-relaxed space-y-4">
                <p>
                  "The idea for The Tomorrows Team came from my own struggles with public speaking during college. I realized that while technical skills can be learned from books and courses, communication skills require practice with real people in real situations."
                </p>
                <p>
                  "After years of participating in debates, group discussions, and public speaking events, I discovered that the best learning happens in a supportive community where people aren't afraid to make mistakes and grow together."
                </p>
                <p>
                  "Today, The Tomorrows Team is that community for thousands of young professionals and students across India. We're not just building better speakers; we're building confident leaders who will shape tomorrow's world."
                </p>
                <div className="mt-8 pt-6 border-t border-border">
                  <p className="font-semibold">- The Tomorrows Team Founding Team</p>
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
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
              <div className="text-muted-foreground">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">180+</div>
              <div className="text-muted-foreground">GDs Conducted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">45+</div>
              <div className="text-muted-foreground">Podcast Episodes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
