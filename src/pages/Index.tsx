import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Users, Mic, Trophy, Calendar, Play, Star } from 'lucide-react';
const Index = () => {
  const features = [{
    icon: <Users className="w-6 h-6" />,
    title: "Group Discussions",
    description: "Join weekly online GDs with like-minded peers and practice your communication skills."
  }, {
    icon: <Mic className="w-6 h-6" />,
    title: "Podcasts & Videos",
    description: "Learn from recorded sessions and expert insights to improve your speaking style."
  }, {
    icon: <Trophy className="w-6 h-6" />,
    title: "Rewards & Recognition",
    description: "Earn points, climb the leaderboard, and get recognized for your participation."
  }];
  const upcomingGDs = [{
    date: "Jan 11, 2025",
    time: "7:00 PM IST",
    topic: "AI in Education: Boon or Bane?",
    spots: 12
  }, {
    date: "Jan 12, 2025",
    time: "8:00 PM IST",
    topic: "Mental Health Awareness in Workplaces",
    spots: 8
  }, {
    date: "Jan 13, 2025",
    time: "6:30 PM IST",
    topic: "Sustainable Living: Individual vs Corporate Responsibility",
    spots: 15
  }];
  const testimonials = [{
    name: "Priya Sharma",
    role: "MBA Student, IIM Bangalore",
    content: "The GDs here helped me ace my job interviews. The real-time feedback is incredible!",
    rating: 5
  }, {
    name: "Arjun Patel",
    role: "Software Engineer, Bangalore",
    content: "I went from being the quiet one to leading discussions. Best investment in myself!",
    rating: 5
  }, {
    name: "Sneha Gupta",
    role: "College Student, Delhi University",
    content: "Amazing community! I've made friends while improving my communication skills.",
    rating: 5
  }];
  return <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient py-24 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              Speak Up. Stand Out.<br />
              <span className="text-white/90">Shape Tomorrow.</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto animate-fade-in">
              Join a growing community of bold thinkers improving their communication skills through live group discussions, podcasts, and resources that matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Link to="/join-gd">
                <Button size="lg" className="btn-primary text-lg px-8 py-4">
                  Join a Group Discussion
                </Button>
              </Link>
              <Link to="/watch-learn">
                <Button size="lg" variant="outline" className="btn-outline border-white hover:bg-white text-lg px-8 py-4 text-blue-500">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Past GDs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What We Do
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Empowering young minds through structured communication practice and community learning.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => <Card key={index} className="feature-card text-center">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Upcoming GDs Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Upcoming Group Discussions
            </h2>
            <p className="text-xl text-muted-foreground">
              Reserve your spot in our upcoming sessions
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingGDs.map((gd, index) => <Card key={index} className="feature-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <Calendar className="w-5 h-5 text-primary mr-2" />
                    <span className="text-sm font-medium text-primary">{gd.date} • {gd.time}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{gd.topic}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{gd.spots} spots left</span>
                    <Link to="/join-gd">
                      <Button size="sm" className="btn-primary">Register</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>)}
          </div>
          
          <div className="text-center mt-8">
            <Link to="/join-gd">
              <Button className="btn-secondary">View All Sessions</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sample GD Video */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
            Watch a Sample GD
          </h2>
          <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-muted">
            <iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Sample Group Discussion" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>
          <div className="mt-8">
            <Link to="/watch-learn">
              <Button className="btn-secondary">Explore More Videos</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Community Says
            </h2>
            <p className="text-xl text-muted-foreground">
              Real stories from real participants
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <Card key={index} className="feature-card">
                <CardContent className="p-6">
                  <div className="flex mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Transform Your Communication Skills?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of young professionals who've already started their journey with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/join-gd">
              <Button size="lg" className="btn-primary text-lg px-8 py-4">
                Join Your First GD
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" className="btn-secondary text-lg px-8 py-4">
                See Rewards & Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;