"use client";
import { useTheme } from "../context/themeContext";
import { useScrollContext } from "../context/scrollBarContext";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import emailjs from '@emailjs/browser';

export default function Footer() {
  const scrollbar = useScrollContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        {
          from_name: formData.name,
          from_email: formData.email,
          to_name: 'Yuvraj',
          message: 'New newsletter subscription request',
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '' });
    } catch (error) {
      console.error('Error sending email:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // Initialize Three.js
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create particles
    const particleCount = 1200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 20 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      colors[i3] = 0.4 + Math.random() * 0.2;
      colors[i3 + 1] = 0.4 + Math.random() * 0.2;
      colors[i3 + 2] = 0.8 + Math.random() * 0.2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse interaction
    const mouse = new THREE.Vector2();
    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      particles.rotation.x = elapsedTime * 0.05;
      particles.rotation.y = elapsedTime * 0.03;
      
      camera.position.x += (mouse.x * 10 - camera.position.x) * 0.05;
      camera.position.y += (-mouse.y * 10 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);
      
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      id="footer"
      className="min-h-screen px-4 lg:px-8 max-w-screen-2xl mx-auto relative"
    >
      <div ref={containerRef} className="absolute inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-20">
        <div className="w-full max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16">
            connect with us today.
          </h2>
          
          <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 md:p-12 lg:p-16 border border-white/10">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
              <div className="space-y-8">
                <h3 className={`text-4xl md:text-5xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Stay Updated
                </h3>
                <p className={`${theme === 'dark' ? 'text-white/80' : 'text-gray-700'} text-xl md:text-2xl leading-relaxed`}>
                  Join our newsletter to receive updates on the latest trends, news, and exclusive offers.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-[#FFD700] rounded-full"></div>
                    <p className={`${theme === 'dark' ? 'text-white/80' : 'text-gray-700'} text-lg`}>Weekly insights</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-[#FFD700] rounded-full"></div>
                    <p className={`${theme === 'dark' ? 'text-white/80' : 'text-gray-700'} text-lg`}>Exclusive offers</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 bg-[#FFD700] rounded-full"></div>
                    <p className={`${theme === 'dark' ? 'text-white/80' : 'text-gray-700'} text-lg`}>Industry news</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className={`block text-lg font-medium ${theme === 'dark' ? 'text-white/80' : 'text-gray-800'} mb-3`}>
                      Your Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={`w-full px-6 py-4 ${theme === 'dark' ? 'bg-white/10 text-white placeholder-white/60' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} backdrop-blur-sm border ${theme === 'dark' ? 'border-white/20' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all text-lg`}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className={`block text-lg font-medium ${theme === 'dark' ? 'text-white/80' : 'text-gray-800'} mb-3`}>
                      Your Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={`w-full px-6 py-4 ${theme === 'dark' ? 'bg-white/10 text-white placeholder-white/60' : 'bg-gray-100 text-gray-900 placeholder-gray-500'} backdrop-blur-sm border ${theme === 'dark' ? 'border-white/20' : 'border-gray-200'} rounded-xl focus:outline-none focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all text-lg`}
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full px-8 py-5 bg-[#FFD700] text-black font-semibold rounded-xl hover:bg-[#FFE44D] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-xl ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Me a Newsletter'}
                </button>
                {submitStatus === 'success' && (
                  <p className="text-green-500 text-center">Thank you for subscribing!</p>
                )}
                {submitStatus === 'error' && (
                  <p className="text-red-500 text-center">Something went wrong. Please try again.</p>
                )}
                <p className={`text-base text-center ${theme === 'dark' ? 'text-white/60' : 'text-gray-600'}`}>
                  By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
      <img
        alt="arrow icon"
        onClick={() => {
          const header = document.getElementById("header");
          if (header) scrollbar?.scrollIntoView(header);
        }}
        src="/large-arrow.svg"
        className="cursor-pointer hover:scale-95 transition-transform absolute h-[35px] w-[35px] md:h-auto md:w-auto bottom-[18px] md:bottom-[16px] right-[16px] lg:right-[32px] rotate-180 dark:invert z-10"
      />
      <div className="absolute bottom-[16px] left-[16px] lg:left-[32px] text-[14px] uppercase max-w-[150px] md:max-w-[60%] md:w-[60%] md:flex md:justify-between z-10">
        <p className="font-light">Copyright © 2024 Big Money Club</p>
      </div>
    </div>
  );
}
