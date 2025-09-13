import React, { useState, useEffect } from 'react';
import { Moon, Sun, Palette, ChevronDown, Star, Heart, Zap, Users, TrendingUp, Award } from 'lucide-react';

const themes = {
  ocean: {
    name: 'Ocean Breeze',
    background: 'radial-gradient(circle, #3498db, #e74c3c)',
    primary: '#3498db',
    secondary: '#e74c3c',
    accent: '#f39c12',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    card: 'rgba(255, 255, 255, 0.1)',
    cardHover: 'rgba(255, 255, 255, 0.2)',
    button: 'rgba(255, 255, 255, 0.2)',
    buttonHover: 'rgba(255, 255, 255, 0.3)',
    border: 'rgba(255, 255, 255, 0.2)',
  },
  tropical: {
    name: 'Tropical Sunset',
    background: 'radial-gradient(circle at 75% 25%, #ff6b6b, #4ecdc4, #45b7d1)',
    primary: '#ff6b6b',
    secondary: '#4ecdc4',
    accent: '#45b7d1',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    card: 'rgba(255, 255, 255, 0.1)',
    cardHover: 'rgba(255, 255, 255, 0.2)',
    button: 'rgba(255, 255, 255, 0.2)',
    buttonHover: 'rgba(255, 255, 255, 0.3)',
    border: 'rgba(255, 255, 255, 0.2)',
  },
  cosmic: {
    name: 'Cosmic Aurora',
    background: 'radial-gradient(circle at 30% 70%, #667eea, #764ba2, #f093fb)',
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#f093fb',
    text: '#ffffff',
    textSecondary: 'rgba(255, 255, 255, 0.8)',
    card: 'rgba(255, 255, 255, 0.1)',
    cardHover: 'rgba(255, 255, 255, 0.2)',
    button: 'rgba(255, 255, 255, 0.2)',
    buttonHover: 'rgba(255, 255, 255, 0.3)',
    border: 'rgba(255, 255, 255, 0.2)',
  },
};

const ThemeToggle = ({ currentTheme, onThemeChange, theme }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105"
        style={{
          backgroundColor: theme.button,
          border: `1px solid ${theme.border}`,
          color: theme.text,
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = theme.buttonHover;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = theme.button;
        }}
      >
        <Palette size={18} />
        <span className="hidden sm:inline">{theme.name}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full mt-2 right-0 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden z-50 min-w-48"
          style={{
            backgroundColor: theme.card,
            border: `1px solid ${theme.border}`,
          }}
        >
          {Object.entries(themes).map(([key, themeOption]) => (
            <button
              key={key}
              onClick={() => {
                onThemeChange(key);
                setIsOpen(false);
              }}
              className="w-full px-4 py-3 text-left transition-all duration-200 flex items-center gap-3"
              style={{
                color: currentTheme === key ? theme.accent : theme.text,
                backgroundColor: currentTheme === key ? theme.buttonHover : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (currentTheme !== key) {
                  e.target.style.backgroundColor = theme.button;
                }
              }}
              onMouseLeave={(e) => {
                if (currentTheme !== key) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div 
                className="w-4 h-4 rounded-full"
                style={{ background: themeOption.background }}
              />
              {themeOption.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Card = ({ children, className = '', theme, delay = 0 }) => {
  return (
    <div
      className={`backdrop-blur-md rounded-2xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${className}`}
      style={{
        backgroundColor: theme.card,
        border: `1px solid ${theme.border}`,
        animationDelay: `${delay}ms`,
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = theme.cardHover;
        e.target.style.transform = 'scale(1.05) translateY(-5px)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = theme.card;
        e.target.style.transform = 'scale(1) translateY(0)';
      }}
    >
      {children}
    </div>
  );
};

const Button = ({ children, variant = 'primary', className = '', theme, onClick, ...props }) => {
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.primary,
          color: '#ffffff',
          hoverColor: theme.secondary,
        };
      case 'secondary':
        return {
          backgroundColor: theme.button,
          color: theme.text,
          hoverColor: theme.buttonHover,
        };
      case 'accent':
        return {
          backgroundColor: theme.accent,
          color: '#ffffff',
          hoverColor: theme.primary,
        };
      default:
        return {
          backgroundColor: theme.button,
          color: theme.text,
          hoverColor: theme.buttonHover,
        };
    }
  };

  const styles = getButtonStyles();

  return (
    <button
      className={`px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-md ${className}`}
      style={{
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        border: `1px solid ${theme.border}`,
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = styles.hoverColor;
        e.target.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = styles.backgroundColor;
        e.target.style.transform = 'scale(1)';
      }}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const StatCard = ({ icon: Icon, title, value, description, theme, delay }) => {
  return (
    <Card theme={theme} delay={delay} className="text-center">
      <div 
        className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
        style={{ backgroundColor: theme.primary }}
      >
        <Icon size={24} color="#ffffff" />
      </div>
      <h3 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
        {value}
      </h3>
      <p className="font-medium mb-1" style={{ color: theme.text }}>
        {title}
      </p>
      <p className="text-sm" style={{ color: theme.textSecondary }}>
        {description}
      </p>
    </Card>
  );
};

const FeatureCard = ({ icon: Icon, title, description, theme, delay }) => {
  return (
    <Card theme={theme} delay={delay}>
      <div 
        className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
        style={{ backgroundColor: theme.accent }}
      >
        <Icon size={20} color="#ffffff" />
      </div>
      <h3 className="text-xl font-semibold mb-3" style={{ color: theme.text }}>
        {title}
      </h3>
      <p style={{ color: theme.textSecondary }} className="leading-relaxed">
        {description}
      </p>
    </Card>
  );
};

function App() {
  const [currentTheme, setCurrentTheme] = useState('ocean');
  const [isLoaded, setIsLoaded] = useState(false);
  const theme = themes[currentTheme];

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const stats = [
    { icon: Users, title: 'Active Users', value: '10K+', description: 'Growing community' },
    { icon: TrendingUp, title: 'Growth Rate', value: '150%', description: 'Year over year' },
    { icon: Award, title: 'Awards Won', value: '25+', description: 'Industry recognition' },
    { icon: Star, title: 'Rating', value: '4.9', description: 'User satisfaction' },
  ];

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Experience blazing fast performance with our optimized architecture and cutting-edge technology stack.',
    },
    {
      icon: Heart,
      title: 'User Friendly',
      description: 'Intuitive design that puts user experience first, making complex tasks simple and enjoyable.',
    },
    {
      icon: Star,
      title: 'Premium Quality',
      description: 'Built with attention to detail and premium materials, ensuring reliability and excellence.',
    },
  ];

  return (
    <div 
      className="min-h-screen transition-all duration-1000 ease-in-out"
      style={{ background: theme.background }}
    >
      {/* Navigation */}
      <nav className="backdrop-blur-md border-b" style={{ borderColor: theme.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.primary }}
              >
                <Zap size={20} color="#ffffff" />
              </div>
              <span className="text-xl font-bold" style={{ color: theme.text }}>
                ModernUI
              </span>
            </div>
            <ThemeToggle 
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
              theme={theme}
            />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 
            className={`text-5xl md:text-7xl font-bold mb-6 transition-all duration-1000 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ color: theme.text }}
          >
            Beautiful
            <span 
              className="block bg-gradient-to-r bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(45deg, ${theme.primary}, ${theme.accent})`,
              }}
            >
              Modern Design
            </span>
          </h1>
          <p 
            className={`text-xl md:text-2xl mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
            style={{ color: theme.textSecondary }}
          >
            Experience the perfect blend of aesthetics and functionality with our modern, 
            responsive design system that adapts to your style.
          </p>
          <div 
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-500 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <Button variant="primary" theme={theme}>
              Get Started
            </Button>
            <Button variant="secondary" theme={theme}>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                theme={theme}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ color: theme.text }}>
              Amazing Features
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>
              Discover what makes our platform special with these carefully crafted features
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                theme={theme}
                delay={index * 150}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card theme={theme} className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: theme.text }}>
              Ready to Get Started?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: theme.textSecondary }}>
              Join thousands of satisfied users who have transformed their experience with our platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="accent" theme={theme}>
                Start Free Trial
              </Button>
              <Button variant="secondary" theme={theme}>
                Contact Sales
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 backdrop-blur-md border-t" style={{ borderColor: theme.border }}>
        <div className="max-w-6xl mx-auto text-center">
          <p style={{ color: theme.textSecondary }}>
            © 2024 ModernUI. Built with React and modern design principles.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;