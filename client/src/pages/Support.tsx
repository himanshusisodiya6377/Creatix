import { Phone, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setLoading(true);
    // Simulate sending form
    setTimeout(() => {
      toast.success('Thank you! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-24 px-4 text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center mt-20 mb-24 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Have a question or feedback? We'd love to hear from you. Reach out to us anytime.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-6xl mx-auto mb-24">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
            <h2 className="text-3xl font-bold mb-6 text-white">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="px-4 py-3 bg-white/8 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white placeholder:text-gray-500 outline-none transition-all"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="px-4 py-3 bg-white/8 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white placeholder:text-gray-500 outline-none transition-all"
                />
              </div>
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/8 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white placeholder:text-gray-500 outline-none transition-all"
              />
              <textarea
                name="message"
                placeholder="Your Message"
                rows={6}
                value={formData.message}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/8 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-lg text-white placeholder:text-gray-500 outline-none resize-none transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-semibold rounded-lg transition-all active:scale-95"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Phone */}
          <div className="p-6 rounded-xl border border-white/10 hover:border-emerald-500/40 bg-white/5 hover:bg-white/8 transition-all duration-300">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-900/40">
              <Phone className="size-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Phone</h3>
            <a href="tel:+1234567890" className="text-emerald-400 hover:text-emerald-300 text-sm">
              +1 (234) 567-890
            </a>
            <p className="text-gray-400 text-xs mt-2">Mon-Fri 9AM-5PM EST</p>
          </div>

          {/* Support Hours */}
          <div className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="size-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Support Hours</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium text-white">Monday - Friday</p>
                <p className="text-gray-400">9:00 AM - 5:00 PM EST</p>
              </div>
              <div>
                <p className="font-medium text-white">Email</p>
                <p className="text-gray-400">Available 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Section */}
      <section className="w-full max-w-5xl mx-auto mb-24">
        <div className="p-8 rounded-2xl border border-white/10 bg-white/5">
          <div className="flex items-start gap-4">
            <MapPin className="size-6 text-emerald-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Our Office</h3>
              <p className="text-gray-400 text-lg mb-4">
                123 Creator Street<br/>
                San Francisco, CA 94105<br/>
                United States
              </p>
              <p className="text-gray-400">
                Timezone: Pacific Standard Time (PST)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
