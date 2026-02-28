import { ArrowRight, BarChart3, Brain, Car, Siren, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import SectionTitle from '../components/SectionTitle';

const Home = () => {
  return (
    <div className="bg-slate-50">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-32 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl" />
          <div className="absolute top-32 -left-20 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-teal-700 shadow-sm">
            B.Tech Final Year Project 2026
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-display font-bold text-slate-900 leading-tight">
            Smart Traffic Optimization System
            <span className="block text-transparent bg-clip-text gradient-text">
              Using Real-Time Data & AI
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl">
            A next-generation traffic control platform that detects vehicles in real time, optimizes signal timing with AI, and prioritizes emergency lanes automatically.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/dashboard">
              <Button className="px-6 py-3">
                Launch Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/emergency">
              <Button variant="outline" className="px-6 py-3">
                View Emergency System
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Detection Accuracy', value: '99.2%' },
              { label: 'Average Wait Reduction', value: '45%' },
              { label: 'Emergency Success Rate', value: '100%' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <p className="text-sm uppercase tracking-widest text-slate-500">{stat.label}</p>
                <p className="text-3xl font-display font-semibold text-slate-900 mt-2">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionTitle
          eyebrow="Core Capabilities"
          title="AI-Powered Traffic Intelligence"
          description="Combining computer vision, real-time analytics, and signal optimization for smoother city intersections."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: <Car className="h-6 w-6 text-teal-700" />,
              title: 'Vehicle Detection',
              text: 'YOLOv8 identifies cars, buses, trucks, and bikes with high accuracy in live feeds.',
            },
            {
              icon: <Brain className="h-6 w-6 text-teal-700" />,
              title: 'Signal Optimization',
              text: 'Dynamic timing adapts to congestion, reducing delays and improving flow.',
            },
            {
              icon: <Siren className="h-6 w-6 text-teal-700" />,
              title: 'Emergency Priority',
              text: 'Instant green corridor for ambulances and emergency vehicles with override alerts.',
            },
            {
              icon: <BarChart3 className="h-6 w-6 text-teal-700" />,
              title: 'Live Analytics',
              text: 'Charts, lane rankings, and density views update every few seconds.',
            },
            {
              icon: <ShieldCheck className="h-6 w-6 text-teal-700" />,
              title: 'Reliable Logging',
              text: 'MySQL stores traffic and emergency logs for audits and future training.',
            },
            {
              icon: <ArrowRight className="h-6 w-6 text-teal-700" />,
              title: 'Scalable Design',
              text: 'Ready for multi-intersection deployments with API-driven integration.',
            },
          ].map((feature) => (
            <div key={feature.title} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="text-sm text-slate-600 mt-2">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <SectionTitle
            eyebrow="Tech Stack"
            title="Modern, Reliable, and Fast"
            description="Built with proven frameworks and AI tooling for realtime decision-making."
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              'Python Flask',
              'YOLOv8 + OpenCV',
              'MySQL Analytics',
              'React + Tailwind v3',
            ].map((tech) => (
              <div key={tech} className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
                <p className="font-semibold text-slate-800">{tech}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-teal-300 text-xs uppercase tracking-widest mb-2">Ready for demo?</p>
            <h3 className="text-3xl font-display font-bold">Launch the real-time dashboard now.</h3>
            <p className="text-slate-300 mt-2">Experience live traffic optimization and emergency response.</p>
          </div>
          <Link to="/dashboard">
            <Button className="px-6 py-3 bg-amber-500 hover:bg-amber-600">
              Open Dashboard
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
