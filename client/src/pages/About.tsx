import { Lightbulb, Users, Target, Zap, Heart, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen pb-24 px-4 text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center mt-20 mb-24 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">About Creatix</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Empowering creators and entrepreneurs to build stunning websites and content in seconds with the power of AI.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="w-full max-w-5xl mx-auto mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Our Mission</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-4">
              At Creatix, we believe that creating beautiful websites and engaging content should be effortless and accessible to everyone. We're on a mission to democratize web design and content creation by combining cutting-edge AI technology with intuitive user experience.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              Our vision is to empower millions of creators, entrepreneurs, and businesses to bring their ideas to life without technical barriers or expensive designers.
            </p>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-2xl" />
            <div className="relative p-8 rounded-2xl border border-emerald-500/30 bg-white/5">
              <Lightbulb className="w-16 h-16 text-emerald-400 mb-4" />
              <p className="text-lg font-semibold text-white mb-3">Innovation First</p>
              <p className="text-gray-400">We leverage the latest AI models and web technologies to provide the best possible generation experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="w-full max-w-5xl mx-auto mb-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Our Values</h2>
          <p className="text-gray-400 text-lg">The principles that guide everything we do</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Value 1 */}
          <div className="p-6 rounded-xl border border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-white/8 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform duration-300">
              <Users className="size-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">User-Centric</h3>
            <p className="text-gray-400 text-sm">
              We design every feature with our users in mind. Your success is our success.
            </p>
          </div>

          {/* Value 2 */}
          <div className="p-6 rounded-xl border border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-white/8 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-900/40 group-hover:scale-110 transition-transform duration-300">
              <Target className="size-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Excellence</h3>
            <p className="text-gray-400 text-sm">
              We're committed to delivering the highest quality results and continuous improvement.
            </p>
          </div>

          {/* Value 3 */}
          <div className="p-6 rounded-xl border border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-white/8 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/40 group-hover:scale-110 transition-transform duration-300">
              <Heart className="size-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Accessibility</h3>
            <p className="text-gray-400 text-sm">
              We make creation tools affordable and accessible to creators at all levels.
            </p>
          </div>

          {/* Value 4 */}
          <div className="p-6 rounded-xl border border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-white/8 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4 shadow-lg shadow-orange-900/40 group-hover:scale-110 transition-transform duration-300">
              <Zap className="size-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Speed</h3>
            <p className="text-gray-400 text-sm">
              Get results in seconds, not hours. Time is precious, and we respect it.
            </p>
          </div>

          {/* Value 5 */}
          <div className="p-6 rounded-xl border border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-white/8 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/40 group-hover:scale-110 transition-transform duration-300">
              <Globe className="size-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Global Impact</h3>
            <p className="text-gray-400 text-sm">
              We serve creators worldwide and celebrate the diversity of our community.
            </p>
          </div>

          {/* Value 6 */}
          <div className="p-6 rounded-xl border border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-white/8 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg shadow-rose-900/40 group-hover:scale-110 transition-transform duration-300">
              <Heart className="size-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Transparency</h3>
            <p className="text-gray-400 text-sm">
              We're honest about our capabilities, limitations, and roadmap with our community.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="w-full max-w-5xl mx-auto mb-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose Creatix?</h2>
          <p className="text-gray-400 text-lg">Here's what sets us apart</p>
        </div>

        <div className="space-y-4">
          {/* Feature 1 */}
          <div className="p-6 rounded-xl border border-white/10 hover:border-emerald-500/30 bg-white/5 hover:bg-white/8 transition-all duration-300 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Zap className="size-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Lightning-Fast Generation</h3>
              <p className="text-gray-400">Get complete websites in under 30 seconds using advanced AI models.</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-xl border border-white/10 hover:border-emerald-500/30 bg-white/5 hover:bg-white/8 transition-all duration-300 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Zap className="size-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">No Coding Required</h3>
              <p className="text-gray-400">Create professional websites without writing a single line of code.</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-xl border border-white/10 hover:border-emerald-500/30 bg-white/5 hover:bg-white/8 transition-all duration-300 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Zap className="size-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Full Customization</h3>
              <p className="text-gray-400">Edit and customize every aspect of your generated websites.</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-xl border border-white/10 hover:border-emerald-500/30 bg-white/5 hover:bg-white/8 transition-all duration-300 flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Zap className="size-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Production-Ready Code</h3>
              <p className="text-gray-400">Export clean, optimized HTML, CSS, and JavaScript code.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full max-w-5xl mx-auto mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
            <h3 className="text-4xl font-bold text-emerald-400 mb-2">500+</h3>
            <p className="text-gray-400">Websites Created</p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
            <h3 className="text-4xl font-bold text-purple-400 mb-2">100K+</h3>
            <p className="text-gray-400">Happy Users Worldwide</p>
          </div>

          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
            <h3 className="text-4xl font-bold text-blue-400 mb-2">99.9%</h3>
            <p className="text-gray-400">Platform Uptime</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
