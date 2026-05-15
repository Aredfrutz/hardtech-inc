'use client';

import { useState } from 'react';
import { useFirestore, useStorage } from '@/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { 
  Database, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  Image as ImageIcon,
  FileText,
  LayoutGrid,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import Image from 'next/image';

interface DraftCourse {
  id: string;
  title: string;
  summary: string;
  description: string;
  durationHours: number;
  ncLevel: string;
  status: 'Active' | 'Upcoming';
  imageId: string; // This will store the URL
  instructorIds: string[];
  prerequisites: string[];
  requiredTools: string[];
  fees: {
    tuition: number;
    materials: number;
    total: number;
  };
  modules: { day: string; topic: string; details: string }[];
  faqs: { question: string; answer: string }[];
  isUploading?: boolean;
}

const INITIAL_DRAFTS: DraftCourse[] = [
  {
    id: 'draft_01',
    title: 'iPhone Logic Board Repair',
    summary: 'Level 3/4 hardware repair focusing on micro-soldering and schematic analysis.',
    description: 'Deep dive into the architecture of modern iPhone logic boards. Learn to diagnose power rails, charging circuits, and baseband issues.',
    durationHours: 120,
    ncLevel: 'NC III',
    status: 'Active',
    imageId: '',
    instructorIds: ['mock-instructor-01'],
    prerequisites: ['Basic Soldering', 'Component Identification'],
    requiredTools: ['Microscope', 'Hot Air Station', 'Multimeter'],
    fees: { tuition: 45000, materials: 10000, total: 55000 },
    modules: [
      { day: 'Week 1', topic: 'Schematic Analysis', details: 'Tracing voltage lines and identifying short circuits.' },
      { day: 'Week 2', topic: 'Micro-Soldering', details: 'Replacing ICs and repairing damaged pads.' },
      { day: 'Week 3', topic: 'Final Diagnostics', details: 'Testing board functionality and stress testing.' }
    ],
    faqs: [
      { question: 'Is prior experience needed?', answer: 'Yes, basic electronics knowledge is required.' },
      { question: 'Do I get a certificate?', answer: 'Yes, upon successful completion and assessment.' }
    ]
  },
  {
    id: 'draft_02',
    title: 'Advanced GPU Reballing',
    summary: 'Master the high-stakes art of BGA rework and GPU reballing for high-performance hardware.',
    description: 'Learn the complete workflow of BGA reballing using professional infrared rework stations.',
    durationHours: 80,
    ncLevel: 'NC IV',
    status: 'Active',
    imageId: '',
    instructorIds: ['mock-instructor-02'],
    prerequisites: ['Level 2 Micro-soldering'],
    requiredTools: ['BGA Rework Station', 'Direct Heat Stencils', 'Solder Balls'],
    fees: { tuition: 50000, materials: 15000, total: 65000 },
    modules: [
      { day: 'Week 1', topic: 'Thermal Profiles', details: 'Setting up safe profiles for leaded and lead-free solder.' },
      { day: 'Week 2', topic: 'The Reballing Cycle', details: 'Removal, cleaning, reballing, and reflow.' },
      { day: 'Week 3', topic: 'Validation', details: 'Using X-ray and testing benchmarks.' }
    ],
    faqs: [
      { question: 'What stations are used?', answer: 'We use professional HR-6000 stations.' },
      { question: 'Can I bring my own cards?', answer: 'Yes, for the final module practice.' }
    ]
  },
  {
    id: 'draft_03',
    title: 'MacBook T2/M-Series Specialist',
    summary: 'Advanced troubleshooting for modern Apple laptops with proprietary security chips.',
    description: 'A specialized course for modern MacBook repairs, covering DFU mode restoration and power management.',
    durationHours: 100,
    ncLevel: 'NC IV',
    status: 'Active',
    imageId: '',
    instructorIds: ['mock-instructor-03'],
    prerequisites: ['Advanced Logic Board Repair'],
    requiredTools: ['Apple Configurator 2', 'Power Supply', 'DFU Cable'],
    fees: { tuition: 60000, materials: 12000, total: 72000 },
    modules: [
      { day: 'Day 1-5', topic: 'Power Rails', details: 'Analyzing the G3Hot rail creation.' },
      { day: 'Day 6-10', topic: 'Security Protocol', details: 'DFU restores and T2 communication.' },
      { day: 'Day 11-15', topic: 'M-Series Architecture', details: 'Understanding unified memory and SoC repair.' }
    ],
    faqs: [
      { question: 'Is M3 supported?', answer: 'Yes, our syllabus is updated for the latest silicon.' }
    ]
  },
  {
    id: 'draft_04',
    title: 'CPU Delidding & Thermal Tuning',
    summary: 'High-end PC enthusiast course for thermal optimization and overclocking.',
    description: 'Learn to safely delid CPUs and apply liquid metal for extreme thermal performance.',
    durationHours: 24,
    ncLevel: 'NC II',
    status: 'Upcoming',
    imageId: '',
    instructorIds: ['mock-instructor-04'],
    prerequisites: ['PC Assembly Knowledge'],
    requiredTools: ['Delid Tool', 'Liquid Metal', 'High-Temp Silicone'],
    fees: { tuition: 15000, materials: 5000, total: 20000 },
    modules: [
      { day: 'Day 1', topic: 'Theory', details: 'Thermal dynamics and TIM breakdown.' },
      { day: 'Day 2', topic: 'Execution', details: 'The physical delidding process.' },
      { day: 'Day 3', topic: 'Optimization', details: 'Applying liquid metal and relidding.' }
    ],
    faqs: [
      { question: 'Is this dangerous?', answer: 'With proper tools and training, risk is minimal.' }
    ]
  },
  {
    id: 'draft_05',
    title: 'Firmware & BIOS Recovery',
    summary: 'The binary side of hardware repair. Corrupt BIOS and UEFI recovery techniques.',
    description: 'Learn to use hardware programmers to flash and recover corrupt firmware chips.',
    durationHours: 40,
    ncLevel: 'NC III',
    status: 'Active',
    imageId: '',
    instructorIds: ['mock-instructor-05'],
    prerequisites: ['Computer Fundamentals'],
    requiredTools: ['RT809H Programmer', 'Hex Editor', 'SPI Clips'],
    fees: { tuition: 25000, materials: 5000, total: 30000 },
    modules: [
      { day: 'Module 1', topic: 'Binary Basics', details: 'Hex editing and identifying BIOS regions.' },
      { day: 'Module 2', topic: 'Hardware Flashing', details: 'Desoldering chips for clean reads.' },
      { day: 'Module 3', topic: 'ME Region Cleaning', details: 'Solving long boot times after flash.' }
    ],
    faqs: [
      { question: 'Do we learn about locks?', answer: 'We cover administrative password removal.' }
    ]
  },
  {
    id: 'draft_06',
    title: 'Micro-Soldering Foundations',
    summary: 'Entry-level professional soldering for those new to microscope work.',
    description: 'Build the muscle memory required for board-level repairs.',
    durationHours: 40,
    ncLevel: 'NC II',
    status: 'Active',
    imageId: '',
    instructorIds: ['mock-instructor-01'],
    prerequisites: ['None'],
    requiredTools: ['T210/T245 Handles', 'Solder Wire', 'Flux'],
    fees: { tuition: 15000, materials: 3000, total: 18000 },
    modules: [
      { day: 'Day 1', topic: 'Hand Control', details: 'Working under 10x magnification.' },
      { day: 'Day 2', topic: 'Heat Management', details: 'Melting solder without burning PCBs.' },
      { day: 'Day 3', topic: 'Connector Repair', details: 'FPC replacement techniques.' }
    ],
    faqs: [
      { question: 'Is a microscope provided?', answer: 'Yes, each student has a dedicated station.' }
    ]
  },
  {
    id: 'draft_07',
    title: 'Android Power Rail Specialist',
    summary: 'Troubleshooting the complex power delivery systems of modern Android flagships.',
    description: 'Learn to diagnose Qualcomm and MediaTek PMIC architectures.',
    durationHours: 60,
    ncLevel: 'NC III',
    status: 'Active',
    imageId: '',
    instructorIds: ['mock-instructor-02'],
    prerequisites: ['Level 1 Micro-soldering'],
    requiredTools: ['DC Power Supply', 'Thermal Camera', 'Zillion x Work'],
    fees: { tuition: 35000, materials: 8000, total: 43000 },
    modules: [
      { day: 'Week 1', topic: 'Boot Sequence', details: 'Understanding the first 500ms of boot.' },
      { day: 'Week 2', topic: 'Fault Finding', details: 'Using thermal imagery to spot leaks.' },
      { day: 'Week 3', topic: 'IC Swap', details: 'Replacing modern 0.1mm pitch PMICs.' }
    ],
    faqs: [
      { question: 'Is Samsung covered?', answer: 'Yes, S-series boards are our primary focus.' }
    ]
  },
  {
    id: 'draft_08',
    title: 'Industrial Robotics Circuitry',
    summary: 'Troubleshooting the hardware controllers of industrial robotic arms.',
    description: 'Master the repair of high-voltage motor drivers and controller logic.',
    durationHours: 160,
    ncLevel: 'NC IV',
    status: 'Upcoming',
    imageId: '',
    instructorIds: ['mock-instructor-03'],
    prerequisites: ['Electronics Degree or equivalent'],
    requiredTools: ['Oscilloscope', 'Logic Analyzer', 'High Voltage Probe'],
    fees: { tuition: 120000, materials: 40000, total: 160000 },
    modules: [
      { day: 'Month 1', topic: 'Servo Drive Loops', details: 'Analyzing feedback signals.' },
      { day: 'Month 2', topic: 'Board Repair', details: 'Replacing high-current MOSFETs.' }
    ],
    faqs: [
      { question: 'Do we use real robots?', answer: 'Yes, we have KUKA and Fanuc units.' }
    ]
  },
  {
    id: 'draft_09',
    title: 'Medical Equipment Repair',
    summary: 'High-reliability electronics repair for healthcare diagnostic devices.',
    description: 'Understand IPC Class 3 standards for life-critical electronics.',
    durationHours: 200,
    ncLevel: 'NC IV',
    status: 'Upcoming',
    imageId: '',
    instructorIds: ['mock-instructor-04'],
    prerequisites: ['NC III Electronics'],
    requiredTools: ['ESD Safe Environment', 'Calibrated Multimeter'],
    fees: { tuition: 150000, materials: 50000, total: 200000 },
    modules: [
      { day: 'Quarter 1', topic: 'Compliance', details: 'Standards and safety protocols.' },
      { day: 'Quarter 2', topic: 'Imaging Hardware', details: 'MRI and CT board diagnostics.' }
    ],
    faqs: [
      { question: 'Is placement guaranteed?', answer: 'We partner with 5 major hospital networks.' }
    ]
  },
  {
    id: 'draft_10',
    title: 'Server-Grade Board Restoration',
    summary: 'Heavy-duty circuitry repair for enterprise-level server motherboards.',
    description: 'Repairing multi-socket boards and high-layer count PCBs.',
    durationHours: 80,
    ncLevel: 'NC IV',
    status: 'Active',
    imageId: '',
    instructorIds: ['mock-instructor-05'],
    prerequisites: ['Advanced Logic Board Repair'],
    requiredTools: ['Digital Microscope', 'Phase Analyzer'],
    fees: { tuition: 75000, materials: 25000, total: 100000 },
    modules: [
      { day: 'Week 1', topic: 'VRM Repair', details: 'Multi-phase power delivery troubleshooting.' },
      { day: 'Week 2', topic: 'DIMM Slot Repair', details: 'Micro-jumping broken pins in RAM slots.' }
    ],
    faqs: [
      { question: 'Is this for data centers?', answer: 'Yes, tailored for professional maintenance teams.' }
    ]
  }
];

export function SeedData() {
  const { firestore } = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  
  const [drafts, setDrafts] = useState<DraftCourse[]>(INITIAL_DRAFTS);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleFileUpload = async (draftId: string, file: File) => {
    if (!storage) return;

    setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, isUploading: true } : d));

    try {
      const storageRef = ref(storage, `seed_images/${draftId}_${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setDrafts(prev => prev.map(d => 
        d.id === draftId ? { ...d, imageId: downloadURL, isUploading: false } : d
      ));
      
      toast({ title: "Media Attached", description: `Image processed for draft ID ${draftId}` });
    } catch (error) {
      console.error(error);
      setDrafts(prev => prev.map(d => d.id === draftId ? { ...d, isUploading: false } : d));
      toast({ title: "Upload Failed", variant: "destructive" });
    }
  };

  const handleSeedDatabase = async () => {
    if (!firestore) return;

    setIsSeeding(true);
    const batch = writeBatch(firestore);

    try {
      drafts.forEach((draft) => {
        const { id, isUploading, ...courseData } = draft;
        const ref = doc(collection(firestore, 'courses'));
        batch.set(ref, {
          ...courseData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      toast({ title: "Database Synchronized", description: "10 Curricula successfully drafted to official registry." });
      setIsPreviewOpen(false);
    } catch (error) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'courses_batch',
        operation: 'create',
        requestResourceData: { count: drafts.length }
      }));
    } finally {
      setIsSeeding(false);
    }
  };

  const allImagesUploaded = drafts.every(d => d.imageId !== '');

  return (
    <Card className="bg-primary/5 border-primary/30 rounded-none shadow-xl overflow-hidden">
      <div className="bg-primary/10 px-6 py-3 flex items-center justify-between border-b border-primary/20">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Media-Assisted Initialization</span>
        </div>
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">Technical Pre-seed Hub</p>
          <p className="text-xs font-medium leading-relaxed">
            Preview 10 technical programs and attach custom high-fidelity imagery before executing the final batch registry sync.
          </p>
        </div>

        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 rounded-none bg-primary text-black font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-primary/20 hover:bg-white transition-all">
              <LayoutGrid className="mr-2 h-4 w-4" /> Open Draft Workspace
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] h-[90vh] bg-card border-primary/20 flex flex-col p-0 rounded-none">
            <DialogHeader className="p-8 border-b bg-secondary/20">
              <div className="flex justify-between items-center">
                <div>
                  <DialogTitle className="text-3xl font-black uppercase tracking-tighter">Draft Curricula <span className="text-primary">Workspace</span></DialogTitle>
                  <DialogDescription className="text-[10px] uppercase font-bold tracking-widest mt-2">
                    Attach imagery to all 10 programs before syncing with Firestore.
                  </DialogDescription>
                </div>
                <Button 
                  onClick={handleSeedDatabase} 
                  disabled={isSeeding || !allImagesUploaded}
                  className="bg-primary text-black font-black uppercase text-xs h-14 px-12 rounded-none tracking-widest disabled:opacity-30"
                >
                  {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                  Execute Final Batch Seed
                </Button>
              </div>
            </DialogHeader>

            <div className="flex-grow overflow-y-auto p-8 bg-black/40">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {drafts.map((draft) => (
                  <Card key={draft.id} className="bg-card/80 border-white/5 rounded-none overflow-hidden group flex flex-col h-full">
                    <div className="relative h-40 bg-secondary/30 flex items-center justify-center">
                      {draft.imageId ? (
                        <Image 
                          src={draft.imageId} 
                          alt={draft.title} 
                          fill 
                          className="object-cover grayscale group-hover:grayscale-0 transition-all" 
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 opacity-30">
                          <ImageIcon className="h-8 w-8" />
                          <span className="text-[8px] uppercase font-bold">No Image Attached</span>
                        </div>
                      )}
                      {draft.isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="p-4 flex-grow">
                      <CardTitle className="text-sm font-bold uppercase truncate">{draft.title}</CardTitle>
                      <CardDescription className="text-[9px] uppercase line-clamp-2">{draft.summary}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0">
                      <div className="w-full space-y-2">
                        <Label 
                          htmlFor={`upload-${draft.id}`} 
                          className="w-full flex items-center justify-center gap-2 h-10 border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer text-[10px] font-bold uppercase rounded-none"
                        >
                          <Upload className="h-3 w-3" /> {draft.imageId ? 'Change Image' : 'Attach Image'}
                        </Label>
                        <input 
                          id={`upload-${draft.id}`}
                          type="file" 
                          accept="image/*"
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(draft.id, file);
                          }}
                        />
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
