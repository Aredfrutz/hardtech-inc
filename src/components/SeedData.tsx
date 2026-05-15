'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Database, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function SeedData() {
  const { firestore } = useFirestore();
  const { toast } = useToast();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const seedDatabase = () => {
    if (!firestore) return;

    setStatus('loading');
    const batch = writeBatch(firestore);

    // 1. OFFICIALS SEED DATA
    const officials = [
      { id: 'off_david_hardman_01', name: 'Engr. David Hardman', position: 'Director of Technology', department: 'Leadership', email: 'david@hardtech.academy', bio: 'Former Lead Hardware Engineer with 15 years experience in forensic board analysis and industrial diagnostics.', certifications: ['PhD Electronics', 'Master Micro-Soldering'], imageId: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&h=400&auto=format&fit=crop' },
      { id: 'off_elena_soldero_02', name: 'Prof. Elena Soldero', position: 'Lead Micro-Soldering Instructor', department: 'Faculty', email: 'elena@hardtech.academy', bio: 'Specialist in BGA reballing and logic board restoration for mobile devices.', certifications: ['IPC-7711/7721 Certified', 'Level 4 Technician'], imageId: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&h=400&auto=format&fit=crop' },
      { id: 'off_kenji_sato_03', name: 'Master Tech. Kenji Sato', position: 'Chief of Lab Operations', department: 'Faculty', email: 'kenji@hardtech.academy', bio: 'Expert in GPU reballing and data recovery from physically damaged NAND flash memory.', certifications: ['Hardware Forensic Expert', 'NAND Specialist'], imageId: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&h=400&auto=format&fit=crop' },
      { id: 'off_sarah_chip_04', name: 'Sarah Chipset', position: 'Senior Firmware Engineer', department: 'Engineering', email: 'sarah@hardtech.academy', bio: 'Focuses on BIOS/UEFI recovery and low-level system firmware flashing.', certifications: ['Embedded Systems Specialist'], imageId: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&h=400&auto=format&fit=crop' },
      { id: 'off_rob_resistor_05', name: 'Robert Resistor', position: 'Senior Faculty Member', department: 'Faculty', email: 'robert@hardtech.academy', bio: 'Veteran electronics repair technician specializing in circuit tracing and schematic analysis.', certifications: ['Electronics Master Tech'], imageId: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&h=400&auto=format&fit=crop' }
    ];

    officials.forEach((official) => {
      const ref = doc(firestore, 'officials', official.id);
      batch.set(ref, official);
    });

    // 2. COURSES SEED DATA
    const courses = [
      {
        title: "Advanced GPU Reballing Masterclass",
        summary: "Master the high-stakes art of BGA rework and GPU reballing for high-performance hardware.",
        description: "This intensive program covers the entire workflow of GPU reballing, from safe removal using IR pre-heaters to precise ball placement and reflow using professional stations.",
        durationHours: 72,
        ncLevel: "NC IV",
        status: "Active",
        imageId: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?q=80&w=800&h=600&auto=format&fit=crop",
        instructorIds: ['off_kenji_sato_03'],
        prerequisites: ["Basic Electronics", "Soldering Level 1"],
        requiredTools: ["BGA Rework Station", "Direct Heat Stencils", "NC-559-V2 Flux"],
        fees: { tuition: 45000, materials: 15000, total: 60000 },
        modules: [
          { day: "Week 1", topic: "BGA Anatomy", details: "Understanding ball grid array structures and thermal profiles." },
          { day: "Week 2", topic: "Desoldering Protocols", details: "Safe extraction of chips without pad damage." },
          { day: "Week 3", topic: "The Reballing Cycle", details: "Stenciling, balling, and inspection under 50x magnification." }
        ],
        faqs: [
          { question: "Is a rework station provided?", answer: "Yes, students work on individual HR-6000 stations." },
          { question: "Do we get certification?", answer: "Yes, a HardTech Advanced Reballing Certification is issued." }
        ]
      },
      {
        title: "iPhone Logic Board Diagnostics",
        summary: "Level 3/4 hardware repair focusing on micro-soldering and schematic analysis.",
        description: "Deep dive into the architecture of modern iPhone logic boards. Learn to diagnose power rails, charging circuits, and baseband issues.",
        durationHours: 120,
        ncLevel: "NC III",
        status: "Active",
        imageId: "https://images.unsplash.com/photo-1601524909162-ef87a48798fc?q=80&w=800&h=600&auto=format&fit=crop",
        instructorIds: ['off_elena_soldero_02'],
        prerequisites: ["Component Level Identification"],
        requiredTools: ["JBC Micro-Soldering Station", "JC Programmer", "ZXW Dongle"],
        fees: { tuition: 55000, materials: 10000, total: 65000 },
        modules: [
          { day: "Week 1", topic: "Schematic Reading", details: "Using ZXW and Bitmap software to trace VDD Main rails." },
          { day: "Week 2", topic: "Short Circuit Detection", details: "Using thermal cameras and rosin to find shorts." },
          { day: "Week 3", topic: "IC Replacement", details: "Replacing U2 Tristar and PMIC chips safely." }
        ],
        faqs: [
          { question: "Can I bring my own dead boards?", answer: "Absolutely, hands-on practice on real devices is encouraged." }
        ]
      },
      {
        title: "MacBook T2/M-Series Repair Specialist",
        summary: "Advanced troubleshooting for modern Apple laptops with proprietary security chips.",
        description: "A specialized course for modern MacBook repairs, covering DFU mode restoration, T2 power management, and M1/M2 board architecture.",
        durationHours: 80,
        ncLevel: "NC IV",
        status: "Active",
        imageId: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&h=600&auto=format&fit=crop",
        instructorIds: ['off_david_hardman_01'],
        prerequisites: ["Micro-soldering Level 2"],
        requiredTools: ["Apple Configurator 2", "Oscilloscope", "DC Power Supply"],
        fees: { tuition: 65000, materials: 12000, total: 77000 },
        modules: [
          { day: "Day 1-5", topic: "The G3Hot Rail", details: "Analyzing the creation of the most important rail on the board." },
          { day: "Day 6-10", topic: "USB-C Communication", details: "Troubleshooting CD3215/CD3217 communication cycles." }
        ],
        faqs: [
          { question: "Is M3 included?", answer: "The course updated regularly to include the latest silicon architecture." }
        ]
      },
      {
        title: "Data Recovery: Dead NAND Flash",
        summary: "Advanced techniques to extract data from water-damaged or physically broken mobile storage.",
        description: "Learn to transplant NAND chips and repair critical communication lines to recover data from devices that won't turn on.",
        durationHours: 40,
        ncLevel: "NC IV",
        status: "Active",
        imageId: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=800&h=600&auto=format&fit=crop",
        instructorIds: ['off_kenji_sato_03'],
        prerequisites: ["Micro-Soldering Level 3"],
        requiredTools: ["NAND Programmer", "Stencil Set", "Isopropanol Bath"],
        fees: { tuition: 35000, materials: 8000, total: 43000 },
        modules: [
          { day: "Module 1", topic: "Transplant Theory", details: "The 3-chip swap (NAND, CPU, EEPROM) for encrypted data." },
          { day: "Module 2", topic: "Pad Repair", details: "Micro-jumping pads under a microscope." }
        ],
        faqs: [
          { question: "Is this for SSDs too?", answer: "The techniques apply, but the focus is on mobile devices." }
        ]
      },
      {
        title: "CPU Delidding & Thermal Engineering",
        summary: "High-end PC enthusiast course for thermal optimization and overclocking.",
        description: "Focuses on delidding high-end CPUs to replace thermal interface material with liquid metal for better thermal performance.",
        durationHours: 24,
        ncLevel: "NC II",
        status: "Upcoming",
        imageId: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&h=600&auto=format&fit=crop",
        instructorIds: ['off_rob_resistor_05'],
        prerequisites: ["PC Assembly Knowledge"],
        requiredTools: ["Delid Tool", "Liquid Metal", "High-Temp Silicone"],
        fees: { tuition: 15000, materials: 5000, total: 20000 },
        modules: [
          { day: "Session 1", topic: "Thermal Dynamics", details: "Why factory solder/TIM fails over time." },
          { day: "Session 2", topic: "The Delid Process", details: "Safe separation using precision tools." }
        ],
        faqs: [
          { question: "Does this void warranty?", answer: "Yes, this is an advanced modification course." }
        ]
      },
      {
        title: "Industrial Robotics Circuitry",
        summary: "Troubleshooting the hardware controllers of industrial robotic arms.",
        description: "Learn to repair the motor drivers and sensors on professional-grade robotics hardware.",
        durationHours: 160,
        ncLevel: "NC IV",
        status: "Active",
        imageId: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&h=600&auto=format&fit=crop",
        instructorIds: ['off_sarah_chip_04'],
        prerequisites: ["General Electronics"],
        requiredTools: ["Logic Analyzer", "Solder Pot", "Heat Gun"],
        fees: { tuition: 85000, materials: 25000, total: 110000 },
        modules: [
          { day: "Week 1", topic: "Servo Circuits", details: "Testing PWM signals and driver output." },
          { day: "Week 2", topic: "Control Boards", details: "Micro-repair on central processing units." }
        ],
        faqs: [
          { question: "Do we work on real robots?", answer: "Yes, we have KUKA and FANUC test platforms." }
        ]
      },
      {
        title: "Firmware Engineering & BIOS Recovery",
        summary: "The binary side of hardware repair. Corrupt BIOS and UEFI recovery.",
        description: "Learn to use programmers to flash BIOS chips, remove firmware locks, and recover bricked devices.",
        durationHours: 32,
        ncLevel: "NC III",
        status: "Active",
        imageId: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&h=600&auto=format&fit=crop",
        instructorIds: ['off_sarah_chip_04'],
        prerequisites: ["Computer Fundamentals"],
        requiredTools: ["RT809H Programmer", "Hex Editor", "SOIC8 Clip"],
        fees: { tuition: 25000, materials: 2000, total: 27000 },
        modules: [
          { day: "Day 1", topic: "Hexadecimal Basics", details: "Finding critical offsets in binary files." },
          { day: "Day 2", topic: "Flashing Protocols", details: "SPI communication and chip removal." }
        ],
        faqs: [
          { question: "Is this hacking?", answer: "This is for legitimate repair and recovery purposes." }
        ]
      },
      {
        title: "Medical Equipment Repair Fundamentals",
        summary: "High-reliability electronics repair for healthcare devices.",
        description: "Understanding IPC class 3 standards for soldering and component replacement in medical diagnostics equipment.",
        durationHours: 200,
        ncLevel: "NC IV",
        status: "Upcoming",
        imageId: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=800&h=600&auto=format&fit=crop",
        instructorIds: ['off_david_hardman_01'],
        prerequisites: ["NC III Electronics"],
        requiredTools: ["ESD-Safe Station", "Calibrated Multimeter"],
        fees: { tuition: 120000, materials: 30000, total: 150000 },
        modules: [
          { day: "Month 1", topic: "Standards", details: "Compliance with healthcare electronic standards." }
        ],
        faqs: [
          { question: "Are there job placements?", answer: "We partner with local hospitals for internships." }
        ]
      },
      {
        title: "Micro-Soldering Level 1: Foundations",
        summary: "Entry-level professional soldering for those new to microscope work.",
        description: "Start your journey. Learn proper heat management, flux usage, and handpiece control.",
        durationHours: 40,
        ncLevel: "NC II",
        status: "Active",
        imageId: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=800&h=600&auto=format&fit=crop",
        instructorIds: ['off_elena_soldero_02'],
        prerequisites: ["None"],
        requiredTools: ["Standard Soldering Iron", "Tweezer Set"],
        fees: { tuition: 15000, materials: 3000, total: 18000 },
        modules: [
          { day: "Day 1", topic: "Heat and Flux", details: "Why things melt and how to keep them clean." }
        ],
        faqs: [
          { question: "Do I need a microscope?", answer: "One is provided for every student in the lab." }
        ]
      },
      {
        title: "Server-Grade Board Restoration",
        summary: "Heavy-duty circuitry repair for enterprise-level server motherboards.",
        description: "Focuses on high-layer count PCBs, multi-phase VRM repair, and enterprise storage diagnostics.",
        durationHours: 80,
        ncLevel: "NC IV",
        status: "Upcoming",
        imageId: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=800&h=600&auto=format&fit=crop",
        instructorIds: ['off_rob_resistor_05'],
        prerequisites: ["Advanced Soldering"],
        requiredTools: ["Digital Microscope", "Phase Analyzer"],
        fees: { tuition: 75000, materials: 15000, total: 90000 },
        modules: [
          { day: "Week 1", topic: "VRM Phase Repair", details: "Tracing power distribution on server boards." }
        ],
        faqs: [
          { question: "Is this for data centers?", answer: "Yes, tailored for on-site hardware maintenance." }
        ]
      }
    ];

    courses.forEach((course) => {
      const ref = doc(collection(firestore, 'courses'));
      batch.set(ref, {
        ...course,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    batch.commit()
      .then(() => {
        setStatus('success');
        toast({ title: "System Seeded!", description: "10 Courses and 5 Officials added to registry." });
        setTimeout(() => setStatus('idle'), 3000);
      })
      .catch((error) => {
        setStatus('error');
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'batch_seed',
          operation: 'create',
          requestResourceData: { courses_count: courses.length, officials_count: officials.length }
        }));
      });
  };

  return (
    <Card className="bg-primary/5 border-primary/30 rounded-none shadow-xl overflow-hidden">
      <div className="bg-primary/10 px-6 py-3 flex items-center justify-between border-b border-primary/20">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">System Initialization</span>
        </div>
        {status === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
        {status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">Database Population Tool</p>
          <p className="text-xs font-medium leading-relaxed">
            Execute batch operation to populate the registry with 10 professional curricula and faculty profiles.
          </p>
        </div>
        <Button 
          onClick={seedDatabase} 
          disabled={status === 'loading'}
          className="w-full h-12 rounded-none bg-primary text-black font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-primary/20 hover:bg-white transition-all"
        >
          {status === 'loading' ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Seeding Registry...</>
          ) : (
            <>Seed Technical Database</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from '@/components/ui/card';
