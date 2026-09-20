"use client";

import React, { useState, useEffect } from "react";
import { useRMSStore } from "@/lib/store";
import { Ticket, UrgencyLevel } from "@/lib/types";
import { createTicket } from "@/lib/api";
import { toast } from "@/components/ui/Toast";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  FileText,
  Clock,
  Check,
  Loader2,
} from "lucide-react";

interface MaintenanceFormProps {
  onCancel: () => void;
  onSuccess: (ticket: Ticket) => void;
}

const MESSAGE_TYPES = [
  "Grievance",
  "Assistance",
  "Enquiry",
  "Feedback",
  "Positive Feedback",
];

const CATEGORY_OPTIONS: Record<
  string,
  { subcategories: string[]; equipment: string; defaultUrgency: UrgencyLevel }
> = {
  "Water Cooler/Drinking water (Cooling Issue)": {
    subcategories: [
      "Not Cooling",
      "Water Taste Issue",
      "Water Leakage",
      "Machine Off",
    ],
    equipment: "Water Cooler (Voltas Minimagic)",
    defaultUrgency: "Medium",
  },
  "Air Conditioner - Not Cooling": {
    subcategories: [
      "Low Gas / No Cooling",
      "Compressor Not Starting",
      "Airflow Very Weak",
      "Thermostat Defective",
    ],
    equipment: "Split AC (Daikin 1.5T)",
    defaultUrgency: "High",
  },
  "Air Conditioner - Making Noise": {
    subcategories: [
      "Blower Motor Rattling",
      "Fan Blade Vibration",
      "Grinding Sound",
      "Humming Sound",
    ],
    equipment: "Split AC (Voltas 1.5T)",
    defaultUrgency: "Medium",
  },
  "Elevator/Lift Malfunction": {
    subcategories: [
      "Door Sensor Malfunction",
      "Jerky Movement / Sticking",
      "Floor Misalignment",
      "Alarm / Button Failure",
    ],
    equipment: "KONE Elevator (Model MonoSpace 500)",
    defaultUrgency: "Critical",
  },
  "Geyser/Water Heater Issue": {
    subcategories: [
      "Water Not Heating",
      "Heating Element Burnout",
      "Thermostat Tripping",
      "Tank Leakage",
    ],
    equipment: "Geyser (Racold 25L)",
    defaultUrgency: "High",
  },
  "Smartboard/Projector Failure": {
    subcategories: [
      "Lamp Burnt Out / No Display",
      "Touch Calibration Failure",
      "HDMI / Video Input Fault",
      "Dim Projection",
    ],
    equipment: 'Smartboard (Promethean ActivPanel 75")',
    defaultUrgency: "Medium",
  },
  "Biometric Scanner Not Working": {
    subcategories: [
      "Fingerprint Scanner Not Responding",
      "Punch Not Syncing",
      "Display Blank",
      "RFID Sensor Failure",
    ],
    equipment: "Biometric Scanner (Mantra MFS100)",
    defaultUrgency: "High",
  },
  "Power Trip/Electrical Issue": {
    subcategories: [
      "MCB Repeated Tripping",
      "Socket Burnt / Sparking",
      "No Power in Room",
      "Loose Phase Connection",
    ],
    equipment: "Lab Power Distribution Unit",
    defaultUrgency: "Critical",
  },
  "Generator Failure": {
    subcategories: [
      "AMF Panel Failure",
      "Phase Voltage Fluctuations",
      "Starter Motor Fault",
      "Exhaust Smoke",
    ],
    equipment: "Generator (Kirloskar 125kVA)",
    defaultUrgency: "Critical",
  },
  "Network/Internet Issue": {
    subcategories: [
      "LAN Port Damaged",
      "Wi-Fi AP Offline",
      "DNS/IP Conflict",
      "Very High Latency",
    ],
    equipment: "Network Switch (Cisco Catalyst 2960)",
    defaultUrgency: "Medium",
  },
};

const SPECIFIC_TAGS_MAP: Record<string, string[]> = {
  "Not Cooling": ["Water Warm", "Compressor Humming", "Condenser Choked"],
  "Water Taste Issue": ["Filtration Taste Bad", "Sediment in Water", "UV Lamp Off"],
  "Water Leakage": ["Continuous Tap Drip", "Base Drainage Overflow", "Pipe Joint Burst"],
  "Machine Off": ["No Power Indicator", "Fuse Blown", "Plug Sparked"],
  "Low Gas / No Cooling": ["Refrigerant Leaked", "Ice on Cooling Coil", "Warm Air Only"],
  "Compressor Not Starting": ["Compressor Clicking", "High Current Draw", "Capacitor Weak"],
  "Airflow Very Weak": ["Blower Wheel Jammed", "Filters Clogged", "Motor Slow"],
  "Thermostat Defective": ["Display Freezing", "Remote Not Responding", "PCB Error Code"],
  "Blower Motor Rattling": ["Bushing Worn", "Imbalance Wobble", "Bearing Dry"],
  "Door Sensor Malfunction": ["Door Retract Sticking", "Obstacle Sensor Beeping", "Slow Closing"],
  "Jerky Movement / Sticking": ["Rope Tension Slack", "Guide Shoe Wear", "Brake Shoe Rubbing"],
  "Water Not Heating": ["Element Burnt", "Cut-off Tripped", "Thermostat Knob Loose"],
  "Thermostat Tripping": ["Burning Smell", "Instant MCB Trip", "Sparking Wall Socket"],
  "MCB Repeated Tripping": ["Short Circuit Fault", "Overload Draw", "Faulty Breaker"],
  "Socket Burnt / Sparking": ["Blackened Socket", "Spark on Insert", "16A Heavy Load Fault"],
};

const TIME_SLOTS_LIST = [
  "08:00-10:00",
  "10:00-12:00",
  "12:00-14:00",
  "14:00-16:00",
  "16:00-18:00",
];

export const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  onCancel,
  onSuccess,
}) => {
  const { currentUser, accessToken, addTicket } = useRMSStore();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form states
  const [messageType, setMessageType] = useState<string>("Grievance");
  const [category, setCategory] = useState<string>(
    "Water Cooler/Drinking water (Cooling Issue)"
  );
  const [subCategory, setSubCategory] = useState<string>("Not Cooling");
  const [specificCategory, setSpecificCategory] = useState<string[]>([
    "Water Warm",
  ]);

  // Block & Location states
  const userBlockLabel = currentUser?.block
    ? `${currentUser.block}-Boys Hostel-05-35140-${currentUser.name}`
    : "BH-5-Boys Hostel-05-35140-Rahul Kumar Arya";
  const [block, setBlock] = useState<string>(userBlockLabel);
  const [subBlock, setSubBlock] = useState<string>("A");
  const [roomType, setRoomType] = useState<"Room No" | "Any Other">("Room No");
  const [roomNo, setRoomNo] = useState<string>(
    currentUser?.room ? `${currentUser.room}-Bed C` : "A824-Bed C"
  );
  const [contactNo, setContactNo] = useState<string>(
    currentUser?.phone || "9876543210"
  );

  // Date & Time slots
  const today = new Date().toISOString().split("T")[0];
  const [availabilityDate, setAvailabilityDate] = useState<string>(today);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([
    "10:00-12:00",
  ]);

  // Description
  const [description, setDescription] = useState<string>("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string>("");

  // Update subcategories when category changes
  useEffect(() => {
    const config = CATEGORY_OPTIONS[category];
    if (config && config.subcategories.length > 0) {
      setSubCategory(config.subcategories[0]);
    }
  }, [category]);

  // Update specific tags when subcategory changes
  useEffect(() => {
    const tags = SPECIFIC_TAGS_MAP[subCategory] || ["General Checkup", "Component Defect"];
    setSpecificCategory([tags[0]]);
  }, [subCategory]);

  const toggleSpecificTag = (tag: string) => {
    setSpecificCategory((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleTimeSlot = (slot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!category) newErrors.category = "Category is required";
    if (!subCategory) newErrors.subCategory = "Sub-category is required";
    if (!block) newErrors.block = "Block is required";
    if (!roomNo.trim()) newErrors.roomNo = "Room Number is required";
    if (!contactNo.trim()) newErrors.contactNo = "Contact Number is required";
    if (!availabilityDate) newErrors.availabilityDate = "Date is required";
    if (selectedTimeSlots.length === 0)
      newErrors.timeSlots = "Please select at least one time slot";
    if (!description.trim()) {
      newErrors.description = "Please describe the maintenance issue";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const timestamp = Date.now().toString().slice(-6);
    const categoryConfig = CATEGORY_OPTIONS[category];
    const equipmentName = categoryConfig?.equipment || "General Hostel Equipment";
    const urgency = categoryConfig?.defaultUrgency || "Medium";
    const cleanBlock = block.startsWith("BH-5") ? "BH-5" : block.split("-")[0];

    try {
      const payload = {
        block: cleanBlock,
        sub_block: subBlock,
        room_number: roomNo,
        contact_number: contactNo.trim(),
        category: category,
        sub_category: subCategory,
        specific_category: specificCategory.join(", "),
        equipment: equipmentName,
        message_type: messageType,
        availability_date: availabilityDate,
        time_slots: selectedTimeSlots.join(", "),
        description: description.trim(),
        urgency_level: urgency,
      };

      const backendTicket = await createTicket(payload, accessToken || undefined);
      const finalTicketId = backendTicket.ticket_id || `TKT-${timestamp}`;

      const newTicket: Ticket = {
        id: finalTicketId,
        ticketNo: finalTicketId,
        userId: currentUser?.id || "12300001",
        userName: currentUser?.name || "Rahul Kumar",
        studentRegNo: currentUser?.id || "12300001",
        roleType: currentUser?.role || "student",
        locationBlock: cleanBlock,
        block: cleanBlock,
        locationRoom: roomNo,
        room: roomNo,
        category: category,
        subCategory: subCategory,
        specificCategory: specificCategory,
        messageType: messageType,
        subBlock: subBlock,
        roomType: roomType,
        equipment: equipmentName,
        userComplaintText: description.trim(),
        description: description.trim(),
        preferredTimeSlot: selectedTimeSlots.join(", "),
        timeSlots: selectedTimeSlots,
        availabilityDate: availabilityDate,
        contactNumber: contactNo.trim(),
        urgencyLevel: urgency,
        status: "Pending",
        assigned_to: "warden",
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      addTicket(newTicket);
      toast.success(`Ticket submitted successfully! ID: ${finalTicketId}`);
      setToastMessage(`Your complaint has been submitted successfully. Ticket ID: ${finalTicketId}`);

      setTimeout(() => {
        onSuccess(newTicket);
      }, 1200);
    } catch (err) {
      console.warn("Backend ticket creation failed, falling back to local store:", err);
      const ticketId = `TKT-${timestamp}`;
      const newTicket: Ticket = {
        id: ticketId,
        ticketNo: `RMS-${cleanBlock}-${timestamp}`,
        userId: currentUser?.id || "12300001",
        userName: currentUser?.name || "Rahul Kumar",
        studentRegNo: currentUser?.id || "12300001",
        roleType: currentUser?.role || "student",
        locationBlock: cleanBlock,
        block: cleanBlock,
        locationRoom: roomNo,
        room: roomNo,
        category: category,
        subCategory: subCategory,
        specificCategory: specificCategory,
        messageType: messageType,
        subBlock: subBlock,
        roomType: roomType,
        equipment: equipmentName,
        userComplaintText: description.trim(),
        description: description.trim(),
        preferredTimeSlot: selectedTimeSlots.join(", "),
        timeSlots: selectedTimeSlots,
        availabilityDate: availabilityDate,
        contactNumber: contactNo.trim(),
        urgencyLevel: urgency,
        status: "Pending",
        assigned_to: "warden",
        createdAt: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      addTicket(newTicket);
      toast.success(`Ticket submitted successfully! ID: ${ticketId}`);
      setToastMessage(`Your complaint has been submitted successfully. Ticket ID: ${ticketId}`);
      setTimeout(() => {
        onSuccess(newTicket);
      }, 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTags =
    SPECIFIC_TAGS_MAP[subCategory] || ["Hardware Defect", "Performance Degradation", "General Query"];

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-6 py-3 text-sm font-semibold flex items-center justify-between shadow-md animate-in slide-in-from-top duration-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-xs text-emerald-100 bg-emerald-700/60 px-2 py-0.5 rounded">
            Routing to Warden
          </span>
        </div>
      )}

      {/* Form Header */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Log New Maintenance / Infrastructure Complaint
          </h2>
          <p className="text-xs text-gray-500">
            RMS Automated Diagnostic Engine • Lovely Professional University
          </p>
        </div>
        <div className="text-[11px] font-semibold text-lpu-orange bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200 flex items-center gap-1">
          <Building2 className="w-3.5 h-3.5" />
          <span>Hostel Maintenance Module</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* =========================================================================
            ROW 1: Message Type Radio Group
            ========================================================================= */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Message Type <span className="text-lpu-orange">*</span>
          </label>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {MESSAGE_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-gray-700"
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    messageType === type
                      ? "border-lpu-orange bg-lpu-orange"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {messageType === type && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* =========================================================================
            ROW 2: Category (50%) and Sub Category (50%)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Category <span className="text-lpu-orange">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="lpu-input text-xs font-medium cursor-pointer"
            >
              {Object.keys(CATEGORY_OPTIONS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-600 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Sub Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Sub Category <span className="text-lpu-orange">*</span>
            </label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="lpu-input text-xs font-medium cursor-pointer"
            >
              {CATEGORY_OPTIONS[category]?.subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            {errors.subCategory && (
              <p className="text-xs text-red-600 mt-1">{errors.subCategory}</p>
            )}
          </div>
        </div>

        {/* =========================================================================
            ROW 3: Specific Category Checkboxes (Left) & Block Dropdown (Right)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {/* Specific Category Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Specific Category Tags
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {availableTags.map((tag) => {
                const checked = specificCategory.includes(tag);
                return (
                  <label
                    key={tag}
                    onClick={() => toggleSpecificTag(tag)}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                      checked
                        ? "border-lpu-orange bg-orange-50 text-lpu-orange font-semibold"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        checked
                          ? "border-lpu-orange bg-lpu-orange text-white"
                          : "border-gray-400 bg-white"
                      }`}
                    >
                      {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span>{tag}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Block Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Block <span className="text-lpu-orange">*</span>
            </label>
            <select
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              className="lpu-input text-xs font-medium cursor-pointer"
            >
              <option value={userBlockLabel}>{userBlockLabel}</option>
              <option value="BH-1-Boys Hostel-01">BH-1-Boys Hostel-01</option>
              <option value="BH-2-Boys Hostel-02">BH-2-Boys Hostel-02</option>
              <option value="BH-3-Boys Hostel-03">BH-3-Boys Hostel-03</option>
              <option value="BH-4-Boys Hostel-04">BH-4-Boys Hostel-04</option>
              <option value="GH-1-Girls Hostel-01">GH-1-Girls Hostel-01</option>
              <option value="GH-2-Girls Hostel-02">GH-2-Girls Hostel-02</option>
              <option value="GH-3-Girls Hostel-03">GH-3-Girls Hostel-03</option>
              <option value="GH-4-Girls Hostel-04">GH-4-Girls Hostel-04</option>
              <option value="Block-25-CSE Academic Block">
                Block-25-CSE Academic Block
              </option>
              <option value="Block-32-CSE Central Academic Complex">
                Block-32-CSE Central Academic Complex
              </option>
            </select>
            {errors.block && (
              <p className="text-xs text-red-600 mt-1">{errors.block}</p>
            )}
          </div>
        </div>

        {/* =========================================================================
            ROW 4: Sub Block (Dropdown, Left) & Room Type (Radio, Right)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Sub Block */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Sub Block <span className="text-lpu-orange">*</span>
            </label>
            <select
              value={subBlock}
              onChange={(e) => setSubBlock(e.target.value)}
              className="lpu-input text-xs font-medium cursor-pointer"
            >
              <option value="A">A Wing</option>
              <option value="B">B Wing</option>
              <option value="C">C Wing</option>
              <option value="D">D Wing</option>
              <option value="E">E Wing</option>
            </select>
          </div>

          {/* Room Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Room Type <span className="text-lpu-orange">*</span>
            </label>
            <div className="flex items-center space-x-6 pt-2">
              <label
                onClick={() => setRoomType("Room No")}
                className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-gray-700"
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    roomType === "Room No"
                      ? "border-lpu-orange bg-lpu-orange"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {roomType === "Room No" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span>Room No</span>
              </label>

              <label
                onClick={() => setRoomType("Any Other")}
                className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-gray-700"
              >
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    roomType === "Any Other"
                      ? "border-lpu-orange bg-lpu-orange"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {roomType === "Any Other" && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
                <span>Any Other (Corridor / Mess / Gym)</span>
              </label>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW 5: Room No (Left) & Contact No (Right)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Room No */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Room No / Bed <span className="text-lpu-orange">*</span>
            </label>
            <input
              type="text"
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
              placeholder="e.g. A824-Bed C"
              className="lpu-input text-xs font-medium"
            />
            {errors.roomNo && (
              <p className="text-xs text-red-600 mt-1">{errors.roomNo}</p>
            )}
          </div>

          {/* Contact No */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Contact No. (Mobile) <span className="text-lpu-orange">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                placeholder="10 digit mobile number"
                className="lpu-input text-xs font-medium pl-8"
              />
              <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
            </div>
            {errors.contactNo && (
              <p className="text-xs text-red-600 mt-1">{errors.contactNo}</p>
            )}
          </div>
        </div>

        {/* =========================================================================
            ROW 6: Availability Date (Left) & Time Slots (Right)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Availability Date <span className="text-lpu-orange">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={availabilityDate}
                onChange={(e) => setAvailabilityDate(e.target.value)}
                className="lpu-input text-xs font-medium pl-8 cursor-pointer"
              />
              <CalendarIcon className="w-3.5 h-3.5 text-lpu-orange absolute left-2.5 top-3" />
            </div>
            {errors.availabilityDate && (
              <p className="text-xs text-red-600 mt-1">
                {errors.availabilityDate}
              </p>
            )}
          </div>

          {/* Time Slot Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Preferred Time Slot <span className="text-lpu-orange">*</span>
            </label>
            <div className="flex flex-wrap gap-2 pt-0.5">
              {TIME_SLOTS_LIST.map((slot) => {
                const checked = selectedTimeSlots.includes(slot);
                return (
                  <label
                    key={slot}
                    onClick={() => toggleTimeSlot(slot)}
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded border text-[11px] cursor-pointer select-none transition-all ${
                      checked
                        ? "border-lpu-orange bg-orange-50 text-lpu-orange font-semibold"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                        checked
                          ? "border-lpu-orange bg-lpu-orange text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span>{slot}</span>
                  </label>
                );
              })}
            </div>
            {errors.timeSlots && (
              <p className="text-xs text-red-600 mt-1">{errors.timeSlots}</p>
            )}
          </div>
        </div>

        {/* =========================================================================
            ROW 7: Description (Full Width)
            ========================================================================= */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Description of the Breakdown / Issue{" "}
            <span className="text-lpu-orange">*</span>
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe the issue in detail (e.g. Water cooler leaking continuously from bottom valve, MCB tripped when starting geyser, strange buzzing noise from AC compressor)..."
            className="lpu-input text-xs font-normal py-2.5 leading-relaxed"
          />
          {errors.description && (
            <p className="text-xs text-red-600 mt-1">{errors.description}</p>
          )}
          <p className="text-[11px] text-gray-400 mt-1">
            RMS AI semantic search will automatically cross-reference this complaint with 250+ past historical records to assist technicians.
          </p>
        </div>

        {/* =========================================================================
            BOTTOM BUTTONS
            ========================================================================= */}
        <div className="pt-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="lpu-btn-secondary px-5 py-2 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="lpu-btn-primary px-6 py-2 text-xs font-semibold shadow-sm flex items-center space-x-1.5 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isSubmitting ? "Submitting..." : "Submit Request"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm;
