import {
  Code2, Users, Rocket, Terminal, GitBranch, Trophy, LayoutTemplate, Layers,
  BrainCircuit, Cloud, Smartphone, Binary, Compass, Hammer, GitPullRequest,
  Target, Sparkles, HeartHandshake, Globe, MessagesSquare, Briefcase, Mic,
  ArrowRight, ArrowUpRight, Check, Star,
  Menu, X, ChevronDown, ChevronRight, Clock, Calendar, MapPin, Play, Quote,
  Mail, Phone, Send, Zap, CheckCircle2, Plus, Minus, Search, BookOpen,
  GraduationCap, TrendingUp, Award, Circle, ArrowLeft, ArrowDown, Flame,
  Cpu, Wifi, Radio, Sun, Moon, PlayCircle, Video, UserPlus, Lightbulb,
  Volume2, VolumeX,
} from "lucide-react";

/**
 * Icon registry — explicit imports so Vite tree-shakes to only what we use.
 * Data files reference icons by string name; <Icon name="..."/> resolves it.
 */
const REGISTRY = {
  Code2, Users, Rocket, Terminal, GitBranch, Trophy, LayoutTemplate, Layers,
  BrainCircuit, Cloud, Smartphone, Binary, Compass, Hammer, GitPullRequest,
  Target, Sparkles, HeartHandshake, Globe, MessagesSquare, Briefcase, Mic,
  ArrowRight, ArrowUpRight, Check, Star,
  Menu, X, ChevronDown, ChevronRight, Clock, Calendar, MapPin, Play, Quote,
  Mail, Phone, Send, Zap, CheckCircle2, Plus, Minus, Search, BookOpen,
  GraduationCap, TrendingUp, Award, Circle, ArrowLeft, ArrowDown, Flame,
  Cpu, Wifi, Radio, Sun, Moon, PlayCircle, Video, UserPlus, Lightbulb,
  Volume2, VolumeX,
};

const Icon = ({ name, ...props }) => {
  const Cmp = REGISTRY[name] || Circle;
  return <Cmp {...props} />;
};

export default Icon;
export { REGISTRY as ICONS };
