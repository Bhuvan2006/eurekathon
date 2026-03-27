import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CalendarDays,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Stethoscope,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, isSameDay, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes: string;
  doctor?: { full_name: string };
  patient?: { full_name: string };
}

interface DoctorProfile {
  user_id: string;
  full_name: string;
}

const timeSlots = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
];

const Appointments = () => {
  const { user, profile, activeRole } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);

  const isPatient = activeRole === "patient";

  useEffect(() => {
    if (!user) return;
    fetchAppointments();
    if (isPatient) fetchDoctors();
  }, [user, activeRole]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("appointments").select(`
        *,
        doctor:doctor_id(full_name),
        patient:patient_id(full_name)
      `);

      if (isPatient) {
        query = query.eq("patient_id", user?.id);
      } else {
        query = query.eq("doctor_id", user?.id);
      }

      const { data, error } = await query.order("appointment_date", { ascending: true });
      if (error) throw error;
      setAppointments((data as any[]) || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load appointments.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, user_roles!inner(role)")
      .eq("user_roles.role", "doctor");
    
    if (error) {
      console.error(error);
    } else {
      setDoctors((data as any[]) || []);
    }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedDoctor || !selectedTime) {
      toast.error("Please select a doctor, date, and time slot.");
      return;
    }

    setIsBooking(true);
    try {
      const { error } = await supabase.from("appointments").insert({
        patient_id: user?.id,
        doctor_id: selectedDoctor,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: selectedTime,
        status: "pending"
      });

      if (error) throw error;
      toast.success("Appointment booked successfully!");
      fetchAppointments();
      setSelectedTime("");
    } catch (err) {
      console.error(err);
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled" })
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Appointment cancelled.");
      fetchAppointments();
    } catch (err) {
      console.error(err);
      toast.error("Cancellation failed.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge className="bg-emerald-500/10 text-emerald-500 border-none capitalize">{status}</Badge>;
      case 'cancelled': return <Badge className="bg-rose-500/10 text-rose-500 border-none capitalize">{status}</Badge>;
      default: return <Badge className="bg-amber-500/10 text-amber-500 border-none capitalize">{status}</Badge>;
    }
  };

  const appointmentsOnSelectedDay = appointments.filter(apt => 
    selectedDate ? isSameDay(parseISO(apt.appointment_date), selectedDate) : false
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wider text-foreground">
            Appointments
          </h1>
          <p className="text-muted-foreground">Manage your clinical visits and schedule</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left: Booking / Calendar View */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-border glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                {isPatient ? "Book New Appointment" : "Appointment Calendar"}
              </CardTitle>
              <CardDescription>
                {isPatient 
                  ? "Select a doctor and choose an available slot." 
                  : "View your booked appointments by date."}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md"
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                />
              </div>

              <div className="space-y-6">
                {isPatient ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Doctor</label>
                      <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                        <SelectTrigger className="glass border-border">
                          <SelectValue placeholder="Choose a specialist..." />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map(doc => (
                            <SelectItem key={doc.user_id} value={doc.user_id}>
                              {doc.full_name}
                            </SelectItem>
                          ))}
                          {doctors.length === 0 && (
                            <div className="p-2 text-sm text-center text-muted-foreground">No doctors found.</div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Available Slots</label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map(slot => (
                          <Button
                            key={slot}
                            variant={selectedTime === slot ? "default" : "outline"}
                            size="sm"
                            className="text-xs h-9 glass"
                            onClick={() => setSelectedTime(slot)}
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button 
                      className="w-full h-11 bg-primary hover:bg-primary/90 glow-primary font-bold tracking-wide"
                      onClick={handleBook}
                      disabled={isBooking}
                    >
                      {isBooking ? "Booking..." : "Book Appointment"}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Slots for {selectedDate ? format(selectedDate, "PP") : "Today"}
                    </h3>
                    <div className="space-y-3">
                      {appointmentsOnSelectedDay.length > 0 ? (
                        appointmentsOnSelectedDay.map(apt => (
                          <div key={apt.id} className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-2 w-2 rounded-full bg-primary" />
                              <div>
                                <p className="text-sm font-bold">{apt.appointment_time}</p>
                                <p className="text-xs text-muted-foreground">Patient: {apt.patient?.full_name}</p>
                              </div>
                            </div>
                            {getStatusBadge(apt.status)}
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                          No appointments booked for this day.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Upcoming List */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border glass">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto px-6 pb-6 space-y-4">
                <AnimatePresence mode="popLayout">
                  {appointments.filter(a => a.status !== 'cancelled').length > 0 ? (
                    appointments.filter(a => a.status !== 'cancelled').map((apt, i) => (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 group transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 text-xs font-mono text-primary font-bold">
                              <CalendarDays className="h-3 w-3" />
                              {format(parseISO(apt.appointment_date), "MMM d, yyyy")}
                            </div>
                            <p className="font-bold flex items-center gap-2">
                              {isPatient ? <Stethoscope className="h-3 w-3" /> : <User className="h-3 w-3" />}
                              <span className="truncate">{isPatient ? apt.doctor?.full_name : apt.patient?.full_name}</span>
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {apt.appointment_time}
                            </div>
                          </div>
                          {getStatusBadge(apt.status)}
                        </div>
                        {isPatient && apt.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full mt-4 h-8 text-rose-500 hover:bg-rose-500/10 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleCancel(apt.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Cancel Appointment
                          </Button>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-12 text-center">
                      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
