import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Video } from 'lucide-react';
import { Button } from './ui/Button';
import { Avatar } from './ui/Avatar';
import { cn } from '../lib/utils';
import { AppointmentModal } from './AppointmentModal';
import { CreateAppointmentModal } from './modals/CreateAppointmentModal';
import { useData } from '../context/DataContext';

type ViewMode = 'day' | 'week' | 'month';

export function Calendar({ filteredAppointments }: { filteredAppointments?: any[] }) {
  const [view, setView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const { appointments: allAppointments, addAppointment, updateAppointment } = useData();

  // Use filtered appointments if provided, otherwise use all
  const appointments = filteredAppointments || allAppointments;

  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalData, setCreateModalData] = useState<{
    date?: Date;
    time?: string;
    existingAppointment?: any; // For editing
    source?: 'day' | 'week' | 'month';
  }>({});
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Helper to format date range for header
  const getDateRangeLabel = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric'
    };
    if (view === 'day') {
      return currentDate.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }
    return currentDate.toLocaleDateString('en-US', options);
  };

  // Handle appointment click
  const handleAppointmentClick = (apt: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAppointment(apt);
  };
  // Handle slot click
  const handleSlotClick = (date: Date, time: string, source: 'day' | 'week' | 'month') => {
    setCreateModalData({
      date,
      time,
      source
    });
    setIsCreateModalOpen(true);
  };

  const handlePrev = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (view === 'month') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (view === 'week') {
        newDate.setDate(newDate.getDate() - 7);
      } else if (view === 'day') {
        newDate.setDate(newDate.getDate() - 1);
      }
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate((prevDate) => {
      const newDate = new Date(prevDate);
      if (view === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (view === 'week') {
        newDate.setDate(newDate.getDate() + 7);
      } else if (view === 'day') {
        newDate.setDate(newDate.getDate() + 1);
      }
      return newDate;
    });
  };

  const handleSaveAppointment = (newAppointment: any) => {
    if (newAppointment.id) {
      updateAppointment(newAppointment);
    } else {
      addAppointment(newAppointment);
    }
    setIsCreateModalOpen(false);
  };

  const handleEditAppointment = (appointment: any) => {
    setSelectedAppointment(null); // Close view modal
    setCreateModalData({
      existingAppointment: appointment,
      date: new Date(appointment.date),
      time: appointment.time,
    });
    setIsCreateModalOpen(true);
  };

  return <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-border/50 overflow-visible relative">
    {/* Calendar Header */}
    <div className="flex flex-col md:flex-row items-center justify-between p-4 border-b border-border/50 gap-4 md:gap-0">
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center bg-muted rounded-lg p-1">
          <Button variant="ghost" size="sm" onClick={() => setView('day')} className={cn('px-3 py-1 h-8 rounded-md', view === 'day' && 'bg-white shadow-sm')}>
            Day
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setView('week')} className={cn('px-3 py-1 h-8 rounded-md', view === 'week' && 'bg-white shadow-sm')}>
            Week
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setView('month')} className={cn('px-3 py-1 h-8 rounded-md', view === 'month' && 'bg-white shadow-sm')}>
            Month
          </Button>
        </div>
        <div className="flex items-center gap-2 relative">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Header Date Label / Picker Trigger */}
          <div className="relative">
            <Button
              variant="ghost"
              className="text-lg font-semibold ml-2 min-w-[150px] justify-start hover:bg-muted/50"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              {getDateRangeLabel()}
            </Button>

            {/* Mini Calendar Popover */}
            {isDatePickerOpen && (
              <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:absolute md:top-full md:left-1/2 md:-translate-x-1/2 md:-translate-y-0 mt-2 z-[100] bg-white/95 backdrop-blur-xl border border-primary/10 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-5 w-[300px] max-w-[90vw] animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                <div className="absolute left-0 top-8 w-[5px] h-8 bg-primary rounded-r-lg" />
                <MiniCalendar
                  currentDate={currentDate}
                  onSelectDate={(date: Date) => {
                    setCurrentDate(date);
                    setIsDatePickerOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Backdrop for closing popover */}
          {isDatePickerOpen && (
            <div className="fixed inset-0 z-[90] bg-black/20 md:bg-transparent" onClick={() => setIsDatePickerOpen(false)} />
          )}

        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={() => {
          setCreateModalData({ date: new Date(), time: '09:00' });
          setIsCreateModalOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          New Appointment
        </Button>
      </div>
    </div>

    {/* Calendar Body */}
    <div className="flex-1 overflow-hidden relative">
      {view === 'week' && (
        <WeekView
          currentDate={currentDate}
          appointments={appointments}
          onSlotClick={handleSlotClick}
          onAppointmentClick={handleAppointmentClick}
        />
      )}
      {view === 'day' && (
        <DayView
          currentDate={currentDate}
          appointments={appointments}
          onSlotClick={handleSlotClick}
          onAppointmentClick={handleAppointmentClick}
        />
      )}
      {view === 'month' && (
        <MonthView
          currentDate={currentDate}
          appointments={appointments}
          onSlotClick={handleSlotClick}
          onAppointmentClick={handleAppointmentClick}
        />
      )}
    </div>

    {/* Modals */}
    <AppointmentModal
      isOpen={!!selectedAppointment}
      onClose={() => setSelectedAppointment(null)}
      appointment={selectedAppointment}
      onEdit={() => selectedAppointment && handleEditAppointment(selectedAppointment)}
    />
    <CreateAppointmentModal
      isOpen={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
      initialDate={createModalData.date}
      initialTime={createModalData.time}
      onSave={handleSaveAppointment}
      existingData={createModalData.existingAppointment}
      viewSource={createModalData.source}
    />
  </div>;
}

// --- Sub-components for views ---

function parseLocalDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function WeekView({ currentDate, appointments, onSlotClick, onAppointmentClick }: any) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const startOfWeek = new Date(currentDate);
  const day = startOfWeek.getDay();
  const dist = day === 0 ? 6 : day - 1;
  startOfWeek.setDate(startOfWeek.getDate() - dist);

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="flex flex-col min-w-full">
        {/* Sticky Header Row */}
        <div className="flex sticky top-0 z-50 bg-white border-b border-border/50 shadow-sm">
          {/* Sticky Corner - z-50 + sticky left */}
          <div className="w-12 flex-shrink-0 sticky left-0 z-50 bg-white border-r border-border/50 bg-muted/10"></div>

          {/* Day Headers */}
          <div className="flex flex-1">
            {days.map((day, i) => {
              const date = weekDates[i];
              const isToday = new Date().toDateString() === date.toDateString();
              return (
                <div key={day} className="flex-1 p-2 text-center border-r border-border/50 last:border-r-0 overflow-hidden">
                  <div className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase truncate">
                    {day}
                  </div>
                  <div
                    className={cn(
                      'text-sm sm:text-xl font-semibold mt-1 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center mx-auto rounded-full',
                      isToday ? 'bg-primary text-white' : 'text-foreground'
                    )}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 flex">
          {/* Sticky Time Column - z-40 + sticky left */}
          <div className="w-12 flex-shrink-0 sticky left-0 z-40 bg-white border-r border-border/50">
            {hours.map((hour) => (
              <div key={hour} className="h-[100px] border-b border-border/50 p-1 text-[10px] sm:text-xs text-muted-foreground text-right relative">
                <span className="top-1 absolute right-1">{hour}:00</span>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="flex-1 flex relative">
            {/* Horizontal Lines for Grid (Background) */}
            <div className="absolute inset-0 pointer-events-none z-0">
              {hours.map((hour) => (
                <div key={hour} className="h-[100px] border-b border-border/50 w-full"></div>
              ))}
            </div>

            {/* Columns for Days */}
            {days.map((day, i) => {
              const dayDate = weekDates[i];
              // Filter appts for this day
              const dayAppts = appointments.filter((a: any) => {
                return parseLocalDate(a.date).toDateString() === dayDate.toDateString();
              });

              return (
                <div key={day} className="flex-1 border-r border-border/50 last:border-r-0 relative z-10">
                  {hours.map((hour) => (
                    // Clickable Slot
                    <div
                      key={hour}
                      className="h-[100px] w-full hover:bg-muted/5 transition-colors cursor-pointer"
                      onClick={() => onSlotClick(dayDate, `${hour < 10 ? '0' + hour : hour}:00`, 'week')}
                    ></div>
                  ))}

                  {/* Render Appointments absolutely within the day column */}
                  {dayAppts.map((appt: any) => {
                    const startHour = parseInt(appt.time.split(':')[0]);
                    const startMin = parseInt(appt.time.split(':')[1]);
                    // Calculate top offset: (Hour * 100px) + (Min/60 * 100px)
                    const top = (startHour * 100) + ((startMin / 60) * 100);
                    // Calculate height: (Duration/60 * 100px)
                    const height = (appt.duration / 60) * 100;

                    return (
                      <div
                        key={appt.id}
                        className={cn("absolute left-0.5 right-0.5 rounded sm:rounded-lg p-1 sm:p-2 cursor-pointer hover:shadow-md transition-all z-20 flex flex-col justify-between overflow-hidden group", appt.color)}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        onClick={(e) => onAppointmentClick(appt, e)}
                      >
                        <div className="flex justify-between items-start">
                          <div className={cn("text-[10px] sm:text-xs font-semibold truncate pr-1", appt.color.includes('blue') ? "text-blue-700" : "text-gray-700")}>
                            {appt.clientName}
                          </div>
                        </div>
                        {height > 40 && (
                          <div className="hidden sm:block text-[10px] truncate opacity-80">
                            {appt.type}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function DayView({ currentDate, appointments, onSlotClick, onAppointmentClick }: any) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4">
        {hours.map((hour) => {
          const cellAppts = appointments.filter((a: any) => {
            const aDate = parseLocalDate(a.date);
            const aHour = parseInt(a.time.substring(0, 2));
            return aDate.toDateString() === currentDate.toDateString() && aHour === hour;
          });

          return (
            <div key={hour} className="flex border-b border-border/50 min-h-[120px] group">
              <div className="w-20 py-4 text-sm text-muted-foreground border-r border-border/50 pr-4 text-right">
                {hour}:00
              </div>
              <div
                className="flex-1 relative p-2 hover:bg-muted/5 transition-colors cursor-pointer"
                onClick={() => onSlotClick(currentDate, `${hour < 10 ? '0' + hour : hour}:00`, 'day')}
              >
                {cellAppts.map((appt: any) => (
                  <div
                    key={appt.id}
                    className={cn("absolute top-2 left-2 right-2 bottom-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all flex justify-between items-start", appt.color)}
                    onClick={(e) => onAppointmentClick(appt, e)}
                  >
                    <div>
                      <div className="font-semibold text-blue-900">
                        {appt.clientName}
                      </div>
                      <div className="text-sm text-blue-700 mt-1">
                        {appt.type} • {appt.duration} min
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-blue-600">
                        <Avatar fallback={appt.clientName[0]} size="sm" className="h-6 w-6 bg-blue-200 text-blue-800" />
                        <span>{appt.clinician}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-blue-200 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                        {appt.status}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/50 hover:bg-white text-blue-700 h-10 w-10 p-0 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(appt.videoLink || 'https://zoom.us', '_blank');
                        }}
                      >
                        <Video className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({ currentDate, appointments, onSlotClick, onAppointmentClick }: any) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;
    const daysArray = [];
    for (let i = 0; i < startDay; i++) daysArray.push(null);
    for (let i = 1; i <= daysInMonth; i++) daysArray.push(new Date(year, month, i, 12, 0, 0));
    return daysArray;
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 border-b border-border/50">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-sm font-medium text-muted-foreground uppercase"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr">
        {days.map((date, i) => {
          if (!date) return <div key={i} className="bg-muted/5 border-r border-b border-border/50 min-h-[100px]"></div>;
          const dateStr = date.toDateString();
          const isToday = new Date().toDateString() === dateStr;
          const dayAppts = appointments.filter((a: any) => parseLocalDate(a.date).toDateString() === dateStr);
          const clickDate = new Date(date);
          clickDate.setHours(12, 0, 0, 0);

          return (
            <div
              key={i}
              className={cn(
                'border-r border-b border-border/50 p-2 relative hover:bg-muted/5 transition-colors cursor-pointer min-h-[100px]',
              )}
              onClick={() => onSlotClick(clickDate, '', 'month')}
            >
              <div
                className={cn(
                  'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1',
                  isToday ? 'bg-primary text-white' : 'text-muted-foreground'
                )}
              >
                {date.getDate()}
              </div>

              <div className="space-y-1">
                {dayAppts.map((appt: any) => (
                  <div
                    key={appt.id}
                    className={cn("text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80",
                      appt.color.includes('blue') ? "bg-blue-100 text-blue-700" :
                        (appt.color.includes('purple') ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700")
                    )}
                    onClick={(e) => onAppointmentClick(appt, e)}
                  >
                    {appt.time.split(':')[0]}a {appt.clientName.split(' ')[0][0]}. {appt.clientName.split(' ')[1]}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {Array.from({ length: (Math.ceil(days.length / 7) * 7) - days.length }).map((_, i) => (
          <div key={`empty-end-${i}`} className="bg-muted/5 border-r border-b border-border/50 min-h-[100px]"></div>
        ))}
      </div>
    </div>
  );
}

function MiniCalendar({ currentDate, onSelectDate }: { currentDate: Date, onSelectDate: (date: Date) => void }) {
  const [viewDate, setViewDate] = useState(new Date(currentDate));
  useEffect(() => { setViewDate(new Date(currentDate)); }, [currentDate]);
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;
    const days = [];
    for (let i = 0; i < startDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };
  const days = getDaysInMonth(viewDate);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const prevMonth = () => { setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)); };
  const nextMonth = () => { setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-sm">
          {months[viewDate.getMonth()]} {viewDate.getFullYear()}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={prevMonth}><ChevronLeft className="h-3 w-3" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={nextMonth}><ChevronRight className="h-3 w-3" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => (<div key={d} className="text-[10px] text-muted-foreground font-medium">{d}</div>))}
        {days.map((date, i) => {
          if (!date) return <div key={i} />;
          const isSelected = date.toDateString() === currentDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div key={i} className={cn("h-7 w-7 flex items-center justify-center rounded-md text-sm cursor-pointer hover:bg-muted transition-colors", isSelected && "bg-primary text-white hover:bg-primary/90", isToday && !isSelected && "text-primary font-medium bg-primary/10")} onClick={() => onSelectDate(date)}>
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
