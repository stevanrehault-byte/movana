// ═══════════════════════════════════════════════════════════════
// @movana/ui - Shared UI Components
// ═══════════════════════════════════════════════════════════════

// Utilities
export { cn } from './lib/utils';

// Brand Components
export { Logo } from './components/brand/Logo';
export { GradientText } from './components/brand/GradientText';

// Layout Components
export { Container } from './components/layout/Container';
export { Section } from './components/layout/Section';
export { GradientBackground } from './components/layout/GradientBackground';

// Navigation
export { Navbar } from './components/navigation/Navbar';
export { Footer } from './components/navigation/Footer';
export { MobileMenu } from './components/navigation/MobileMenu';

// UI Primitives (shadcn/ui based)
export { Button, buttonVariants } from './components/ui/button';
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export { Textarea } from './components/ui/textarea';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './components/ui/card';
export { Badge, badgeVariants } from './components/ui/badge';
export { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
export { Separator } from './components/ui/separator';
export { Skeleton } from './components/ui/skeleton';
export { Switch } from './components/ui/switch';
export { Checkbox } from './components/ui/checkbox';
export { RadioGroup, RadioGroupItem } from './components/ui/radio-group';
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator } from './components/ui/select';
export { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './components/ui/accordion';
export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './components/ui/dialog';
export { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from './components/ui/sheet';
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from './components/ui/dropdown-menu';
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './components/ui/tooltip';
export { Progress } from './components/ui/progress';
export { ScrollArea, ScrollBar } from './components/ui/scroll-area';
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from './components/ui/table';

// Movana-specific Components
export { RouteCard } from './components/movana/RouteCard';
export { OperatorCard } from './components/movana/OperatorCard';
export { SearchBox } from './components/movana/SearchBox';
export { Rating } from './components/movana/Rating';
export { DifficultyBadge } from './components/movana/DifficultyBadge';
export { ThemeBadge } from './components/movana/ThemeBadge';
export { StatCard } from './components/movana/StatCard';
export { PricingCard } from './components/movana/PricingCard';
export { FeatureCard } from './components/movana/FeatureCard';

// Form Components
export { FormField } from './components/forms/FormField';
export { FormError } from './components/forms/FormError';
export { FormSection } from './components/forms/FormSection';

// Loading States
export { Spinner } from './components/loading/Spinner';
export { PageLoader } from './components/loading/PageLoader';
export { CardSkeleton } from './components/loading/CardSkeleton';

// Empty States
export { EmptyState } from './components/empty/EmptyState';
export { NoResults } from './components/empty/NoResults';

// Types
export type { RouteCardProps } from './components/movana/RouteCard';
export type { OperatorCardProps } from './components/movana/OperatorCard';
