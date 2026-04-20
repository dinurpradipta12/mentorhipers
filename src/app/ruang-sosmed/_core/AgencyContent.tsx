"use client";

import React, { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Users, 
  Layers, 
  Target, 
  Plus, 
  ChevronRight, 
  Settings, 
  Zap, 
  Sparkles, 
  LogOut,
  LayoutDashboard,
  Search,
  MessageSquare,
  ArrowUpRight,
  ArrowRight,
  Shield,
  Table2,
  Kanban,
  FileText,
  Play,
  Link as LinkIcon,
  Calendar as CalendarIcon,
  Trash2,
  AlertCircle,
  X,
  Video,
  UserPlus,
  ShieldCheck,
  User,
  Copy,
  Check,
  ExternalLink,
  Palette,
  Edit
} from "lucide-react";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { getCachedSession, isLegacyAdmin } from "@/lib/authCache";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AvatarCreator from "./AvatarCreator";

export default function AgencyContent({ id }: { id: string }) {
  const resolvedParams = { id };
  const [activeTab, setActiveTab] = useState("dashboard");
  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [contentPlans, setContentPlans] = useState<any[]>([]);
  const [contentView, setContentView] = useState<'table' | 'kanban' | 'calendar'>('table');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [tempLinkValue, setTempLinkValue] = useState("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    platform: "tiktok",
    content_url: "",
    due_date: "",
    content_pillar: "",
    headline: "",
    script_url: "",
    result_url: "",
    published_url: ""
  });
  const [memberForm, setMemberForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "team_member",
    avatar_url: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChoosingAvatar, setIsChoosingAvatar] = useState(false);
  const [profileForm, setProfileForm] = useState({ full_name: "", avatar_url: "" });
  const [meetings, setMeetings] = useState<any[]>([]);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<any | null>(null);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    meeting_link: "",
    category: "internal"
  });
  const [isRoadmapModalOpen, setIsRoadmapModalOpen] = useState(false);
  const [roadmapForm, setRoadmapForm] = useState({
    title: "",
    description: "",
    target_date: "",
    progress: 0,
    status: "planned"
  });
  const [selectedRoadmapMemberIds, setSelectedRoadmapMemberIds] = useState<string[]>([]);
  const [selectedMeetingAttendeeIds, setSelectedMeetingAttendeeIds] = useState<string[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
  const [copying, setCopying] = useState(false);
  const router = useRouter();

  const isAdmin = isLegacyAdmin() || userRole === 'owner' || userRole === 'admin';

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      await fetchWorkspaceDetail();
      await fetchMembers();
      await fetchRoadmaps();
      await fetchContentPlans();
      await fetchMeetings();
    };

    init();

    // Real-time listener for meetings (Moved outside async init to prevent race conditions)
    const meetingChannel = supabase.channel(`meetings_sync_${resolvedParams.id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'v2_agency_meetings',
        filter: `workspace_id=eq.${resolvedParams.id}`
      }, () => {
        fetchMeetings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(meetingChannel);
    };
  }, [resolvedParams.id]);

  const checkAuth = async () => {
    const legacyAdmin = isLegacyAdmin();
    const session = await getCachedSession();

    if (!session && !legacyAdmin) {
      router.push("/ruang-sosmed/login");
      return;
    }

    if (legacyAdmin) {
      setIsAuthorized(true);
      setUserRole("admin");
      // For Legacy Admin, we use a local state but try to load from localStorage first
      const storedProfile = localStorage.getItem("v2_legacy_profile");
      if (storedProfile) {
        try {
          setCurrentUserProfile(JSON.parse(storedProfile));
        } catch (e) {
          setCurrentUserProfile({ full_name: "Main Authority", role: "admin" });
        }
      } else {
        setCurrentUserProfile({ full_name: "Main Authority", role: "admin" });
      }
    }

    if (session) {
      // 1. Cek Profil Global & Membership secara paralel
      const [profileRes, membershipRes] = await Promise.all([
        supabase.from("v2_profiles").select("full_name, avatar_url, role").eq("id", session.user.id).maybeSingle(),
        supabase.from("v2_memberships").select("id, role").eq("workspace_id", resolvedParams.id).eq("profile_id", session.user.id).maybeSingle()
      ]);

      const profile = profileRes.data;
      const membership = membershipRes.data;

      if (profile?.role === "admin" || membership || legacyAdmin) {
        setIsAuthorized(true);
        if (profile) setCurrentUserProfile(profile);
        const effectiveRole = profile?.role === "admin" ? "admin" : (membership?.role || (legacyAdmin ? "admin" : "team_member"));
        setUserRole(effectiveRole);
      } else {
        router.push("/ruang-sosmed/login");
      }
    }
  };

  const handleUpdateMyProfile = async () => {
    setIsSubmitting(true);
    try {
      const session = await getCachedSession();
      
      if (!session) {
        if (isLegacyAdmin()) {
           // Local update for legacy admins with persistence via localStorage
           const newProfile = {
             ...currentUserProfile,
             full_name: profileForm.full_name,
             avatar_url: profileForm.avatar_url
           };
           setCurrentUserProfile(newProfile);
           localStorage.setItem("v2_legacy_profile", JSON.stringify(newProfile));
           setIsProfileModalOpen(false);
           return;
        }
        alert("Sesi berakhir. Silakan login kembali.");
        return;
      }
      
      const { error } = await supabase.from('v2_profiles').update({
        full_name: profileForm.full_name,
        avatar_url: profileForm.avatar_url
      }).eq('id', session.user.id);

      if (error) {
        console.error("❌ Update Profile Error:", error);
        throw new Error(error.message);
      }
      
      setIsProfileModalOpen(false);
      await checkAuth(); // Refresh profile info
    } catch (e: any) {
      console.error("❌ Catch Error Profile:", e);
      alert("Gagal update profil: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openMyProfileModal = () => {
    if (!currentUserProfile) return;
    setProfileForm({
      full_name: currentUserProfile.full_name || "",
      avatar_url: currentUserProfile.avatar_url || ""
    });
    setIsProfileModalOpen(true);
  };

  const fetchWorkspaceDetail = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('v2_workspaces').select('*').eq('id', resolvedParams.id).single();
    if (data) setWorkspace(data);
    setIsLoading(false);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('v2_memberships')
      .select('*, v2_profiles(*)')
      .eq('workspace_id', resolvedParams.id);
    if (data) setMembers(data);
  };

  const fetchRoadmaps = async () => {
    const { data } = await supabase
      .from('v2_agency_roadmaps')
      .select(`
        *,
        milestones:v2_agency_roadmap_milestones(*, assignee:v2_profiles!assigned_to(*)),
        kpi_members:v2_agency_roadmap_members(*, profile:v2_profiles(*))
      `)
      .eq('workspace_id', resolvedParams.id)
      .order('target_date', { ascending: true });
    if (data) {
      setRoadmaps(data);
      // Refresh selected roadmap detail if it's open
      setSelectedRoadmap((prev: any) => prev ? (data.find((r: any) => r.id === prev.id) || prev) : null);
    }
  };

  const fetchContentPlans = async () => {
    console.log("🔍 Fetching Content Plans for Workspace:", resolvedParams.id);
    const { data, error } = await supabase
      .from('v2_agency_content_plans')
      .select('*, creator:v2_profiles!created_by(*)')
      .eq('workspace_id', resolvedParams.id)
      .order('created_at', { ascending: false });

    if (error) {
       console.error("❌ fetchContentPlans Error:", error.message || "No Message", "Details:", error.details, "Hint:", error.hint);
       return;
    }

    console.log("📊 Content Plans Result:", data?.length || 0, "rows found");
    if (data)    setContentPlans(data || []);
  };

  const fetchMeetings = async () => {
    if (!resolvedParams.id) return;
    try {
      console.log("📅 Fetching meetings for Workspace:", resolvedParams.id);
      const { data, error } = await supabase
        .from('v2_agency_meetings')
        .select(`
          *, 
          creator:v2_profiles!v2_agency_meetings_created_by_fkey(*),
          attendees:v2_agency_meeting_attendees(*, profile:v2_profiles(*))
        `)
        .eq('workspace_id', resolvedParams.id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error("❌ fetchMeetings Error:", error.message, error.details);
        return;
      }
      
      console.log("📊 Meetings Data:", data);
      setMeetings(data || []);
    } catch (e) {
      console.error("❌ fetchMeetings Exception:", e);
    }
  };

  const handleCreateRoadmap = async () => {
    setIsSubmitting(true);
    try {
      const { data: newRoadmap, error } = await supabase
        .from('v2_agency_roadmaps')
        .insert({ ...roadmapForm, workspace_id: resolvedParams.id })
        .select()
        .single();

      if (error) throw error;

      // If members were selected, save their assignments
      if (selectedRoadmapMemberIds.length > 0 && newRoadmap) {
        const memberRows = selectedRoadmapMemberIds.map(profileId => ({
          roadmap_id: newRoadmap.id,
          profile_id: profileId
        }));
        const { error: memberError } = await supabase.from('v2_agency_roadmap_members').insert(memberRows);
        if (memberError) throw memberError;
      }
      
      setIsRoadmapModalOpen(false);
      setRoadmapForm({ title: "", description: "", target_date: "", progress: 0, status: "planned" });
      setSelectedRoadmapMemberIds([]);
      fetchRoadmaps();
    } catch (e: any) {
      alert("Gagal membuat roadmap: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRoadmapStatus = async (id: string, newStatus: string, newProgress: number) => {
    try {
      const { error } = await supabase
        .from('v2_agency_roadmaps')
        .update({ status: newStatus, progress: newProgress })
        .eq('id', id);

      if (error) throw error;
      fetchRoadmaps();
    } catch (e: any) {
      alert("Gagal update roadmap: " + e.message);
    }
  };

  const handleDeleteRoadmap = async (id: string) => {
    if (!confirm("Hapus fase strategi ini?")) return;
    try {
      const { error } = await supabase.from('v2_agency_roadmaps').delete().eq('id', id);
      if (error) throw error;
      fetchRoadmaps();
    } catch (e: any) {
      alert("Gagal hapus roadmap: " + e.message);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, isCompleted: boolean, roadmapId: string) => {
    try {
      const { error } = await supabase
        .from('v2_agency_roadmap_milestones')
        .update({ is_completed: isCompleted })
        .eq('id', milestoneId);

      if (error) throw error;
      
      // Re-calculate roadmap progress based on milestones
      const { data: milestones } = await supabase
        .from('v2_agency_roadmap_milestones')
        .select('is_completed')
        .eq('roadmap_id', roadmapId);
      
      if (milestones && milestones.length > 0) {
        const completed = milestones.filter(m => m.is_completed).length;
        const progress = Math.round((completed / milestones.length) * 100);
        const status = progress === 100 ? 'completed' : (progress > 0 ? 'in_progress' : 'planned');
        
        await supabase
          .from('v2_agency_roadmaps')
          .update({ progress, status })
          .eq('id', roadmapId);
      }

      fetchRoadmaps();
    } catch (e: any) {
      console.error("Error toggling milestone:", e);
    }
  };

  const handleAssignMilestone = async (milestoneId: string, assignedTo: string | null) => {
    try {
      await supabase
        .from('v2_agency_roadmap_milestones')
        .update({ assigned_to: assignedTo })
        .eq('id', milestoneId);
      fetchRoadmaps();
    } catch (e: any) {
      console.error("Error assigning milestone:", e);
    }
  };

  const handleAddKpiMember = async (roadmapId: string, profileId: string) => {
    try {
      const { error } = await supabase.from('v2_agency_roadmap_members').insert({ roadmap_id: roadmapId, profile_id: profileId });
      if (error) throw error;
      await fetchRoadmaps();
      
      // Update selectedRoadmap if it's currently open to reflect changes
      if (selectedRoadmap && selectedRoadmap.id === roadmapId) {
         const { data } = await supabase
            .from('v2_agency_roadmaps')
            .select('*, milestones:v2_agency_roadmap_milestones(*), kpi_members:v2_agency_roadmap_members(*, profile:v2_profiles(*))')
            .eq('id', roadmapId)
            .single();
         if (data) setSelectedRoadmap(data);
      }
    } catch (e: any) {
      console.error("Error adding KPI member:", e);
      alert("Gagal menambahkan member: " + (e.message || "Unauthorized"));
    }
  };

  const handleRemoveKpiMember = async (roadmapId: string, profileId: string) => {
    try {
      const { error } = await supabase.from('v2_agency_roadmap_members')
        .delete()
        .eq('roadmap_id', roadmapId)
        .eq('profile_id', profileId);
      if (error) throw error;
      await fetchRoadmaps();

      // Update selectedRoadmap if it's currently open to reflect changes
      if (selectedRoadmap && selectedRoadmap.id === roadmapId) {
         const { data } = await supabase
            .from('v2_agency_roadmaps')
            .select('*, milestones:v2_agency_roadmap_milestones(*), kpi_members:v2_agency_roadmap_members(*, profile:v2_profiles(*))')
            .eq('id', roadmapId)
            .single();
         if (data) setSelectedRoadmap(data);
      }
    } catch (e: any) {
      console.error("Error removing KPI member:", e);
      alert("Gagal menghapus member: " + (e.message || "Unauthorized"));
    }
  };

  const handleAddMilestone = async (roadmapId: string, title: string, assignedTo?: string | null) => {
    if (!title.trim()) return;
    try {
      const { error } = await supabase.from('v2_agency_roadmap_milestones').insert({
        roadmap_id: roadmapId,
        title: title.trim(),
        is_completed: false,
        assigned_to: assignedTo || null
      });
      if (error) throw error;
      fetchRoadmaps();
    } catch (e: any) {
      alert("Gagal tambah milestone: " + e.message);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase.from('v2_agency_roadmap_milestones').delete().eq('id', milestoneId);
      if (error) throw error;
      fetchRoadmaps();
    } catch (e: any) {
      console.error("Error deleting milestone:", e);
    }
  };

  const handleCreateMeeting = async () => {
    setIsSubmitting(true);
    try {
      const session = await getCachedSession();
      let meetingId = editingMeeting?.id;
      
      if (editingMeeting) {
         const { error } = await supabase.from('v2_agency_meetings').update({
           title: meetingForm.title,
           description: meetingForm.description,
           start_time: meetingForm.start_time,
           end_time: meetingForm.end_time || null,
           meeting_link: meetingForm.meeting_link,
           category: meetingForm.category
         }).eq('id', editingMeeting.id);
         
         if (error) throw error;

         // Sync attendees: delete then re-insert for simplicity in this version
         await supabase.from('v2_agency_meeting_attendees').delete().eq('meeting_id', meetingId);
      } else {
         const { data, error } = await supabase.from('v2_agency_meetings').insert({
           ...meetingForm,
           end_time: meetingForm.end_time || null,
           workspace_id: resolvedParams.id,
           created_by: session?.user.id
         }).select().single();

         if (error) throw error;
         meetingId = data.id;
      }

      // Insert attendees
      if (selectedMeetingAttendeeIds.length > 0 && meetingId) {
         const attendeeRows = selectedMeetingAttendeeIds.map(profileId => ({
            meeting_id: meetingId,
            profile_id: profileId
         }));
         const { error: attendeeError } = await supabase.from('v2_agency_meeting_attendees').insert(attendeeRows);
         if (attendeeError) throw attendeeError;
      }
      
      setIsMeetingModalOpen(false);
      setEditingMeeting(null);
      setSelectedMeetingAttendeeIds([]);
      setMeetingForm({ title: "", description: "", start_time: "", end_time: "", meeting_link: "", category: "internal" });
      await fetchMeetings();
    } catch (e: any) {
      alert("Gagal menyimpan meeting: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMeeting = async (id: string) => {
    if (!confirm("Hapus jadwal meeting ini?")) return;
    try {
      const { error } = await supabase.from('v2_agency_meetings').delete().eq('id', id);
      if (error) throw error;
      fetchMeetings();
    } catch (e: any) {
      alert("Gagal menghapus meeting: " + e.message);
    }
  };

  const openEditMeetingModal = (meeting: any) => {
    setEditingMeeting(meeting);
    
    // Formatting date to work with datetime-local
    let formattedDate = "";
    if (meeting.start_time) {
      const d = new Date(meeting.start_time);
      d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      formattedDate = d.toISOString().slice(0,16);
    }
    
    setMeetingForm({
      title: meeting.title || "",
      description: meeting.description || "",
      start_time: formattedDate,
      end_time: meeting.end_time || "",
      meeting_link: meeting.meeting_link || "",
      category: meeting.category || "internal"
    });

    // Populate attendees if they exist
    if (meeting.attendees) {
       setSelectedMeetingAttendeeIds(meeting.attendees.map((a: any) => a.profile_id));
    } else {
       setSelectedMeetingAttendeeIds([]);
    }

    setIsMeetingModalOpen(true);
  };

  const handleCreateTask = async () => {
    console.log("🚀 Starting Task Creation...");
    if (!taskForm.title) {
       console.warn("⚠️ Title is missing.");
       return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get session
      const session = await getCachedSession();
      console.log("🔑 Session status:", session ? "Found" : "Not Found");
      
      const userId = session?.user?.id || null;
      console.log("📍 Workspace ID:", resolvedParams.id);
      console.log("📝 Data to insert:", { ...taskForm, workspace_id: resolvedParams.id, created_by: userId });

      const { data: task, error: taskError } = await supabase
        .from('v2_agency_content_plans')
        .insert([{
          ...taskForm,
          due_date: taskForm.due_date || null,
          workspace_id: resolvedParams.id,
          created_by: userId,
          status: 'draft'
        }])
        .select()
        .single();

      if (taskError) {
         console.error("❌ Database Error (Content Plan):", taskError);
         throw new Error(`DB Error: ${taskError.message}`);
      }

      console.log("✅ Task created successfully:", task.id);
      setIsTaskModalOpen(false);

      setTaskForm({ 
        title: "", description: "", platform: "tiktok", content_url: "", due_date: "",
        content_pillar: "", headline: "", script_url: "", result_url: "", published_url: ""
      });
      fetchActivities();
      fetchContentPlans();
    } catch (err: any) {
      console.error("🛑 handleCreateTask Catch Block:", err);
      alert("Gagal menyimpan: " + err.message);
      setIsTaskModalOpen(true); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (membershipId: string) => {
    if (!confirm("Hapus akses anggota ini dari workspace?")) return;
    try {
      const { error } = await supabase.from('v2_memberships').delete().eq('id', membershipId);
      if (error) throw error;
      fetchMembers();
    } catch (e: any) {
      alert("Gagal menghapus anggota: " + e.message);
    }
  };

  const handleUpdatePostLink = async (id: string, url: string) => {
    if (!url) return;
    try {
      const { error } = await supabase
        .from('v2_agency_content_plans')
        .update({ published_url: url })
        .eq('id', id);
      
      if (error) throw error;
      setEditingLinkId(null);
      fetchContentPlans();
    } catch (e: any) {
      alert("Gagal update link: " + e.message);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('v2_agency_content_plans')
        .delete()
        .eq('id', taskToDelete.id);
      if (error) throw error;
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      fetchContentPlans();
    } catch (e: any) {
      alert("Gagal hapus: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      platform: task.platform || "tiktok",
      content_url: task.content_url || "",
      due_date: task.due_date || "",
      content_pillar: task.content_pillar || "",
      headline: task.headline || "",
      script_url: task.script_url || "",
      result_url: task.result_url || "",
      published_url: task.published_url || ""
    });
    setIsTaskModalOpen(true);
  };

  const [editingMember, setEditingMember] = useState<any | null>(null);

  const handleAddMember = async () => {
    if (!memberForm.email || (!editingMember && !memberForm.password) || !memberForm.full_name) return;
    setIsSubmitting(true);
    
    try {
      if (editingMember) {
        // 1. Update Profile (Full Name)
        const { error: profileError } = await supabase.from('v2_profiles').update({
          full_name: memberForm.full_name
        }).eq('id', editingMember.profile_id);
        
        if (profileError) throw profileError;

        // 2. Update Membership (Role)
        const { error: memberError } = await supabase.from('v2_memberships').update({
          role: memberForm.role
        }).eq('id', editingMember.id);

        if (memberError) throw memberError;

      } else {
        // Create New Member Flow
        const virtualEmail = memberForm.email.includes('@') ? memberForm.email : `${memberForm.email}@ruangsosmed.v2.local`;

        // 1. Sign up the user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: virtualEmail,
          password: memberForm.password,
          options: {
            data: {
              full_name: memberForm.full_name
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Gagal membuat user auth");

        // 2. Ensure profile exists (Upsert to be sure)
        const { error: profileError } = await supabase.from('v2_profiles').upsert({
          id: authData.user.id,
          full_name: memberForm.full_name,
          email: virtualEmail,
          role: 'user'
        });

        if (profileError && profileError.code !== '23505') throw profileError;

        // 3. Create Membership
        const { error: memberError } = await supabase.from('v2_memberships').insert({
          workspace_id: resolvedParams.id,
          profile_id: authData.user.id,
          role: memberForm.role
        });

        if (memberError) throw memberError;

        setSuccessData({
          full_name: memberForm.full_name,
          username: memberForm.email,
          password: memberForm.password
        });
        setIsSuccessModalOpen(true);
      }

      setIsMemberModalOpen(false);
      setEditingMember(null);
      setMemberForm({ full_name: "", email: "", password: "", role: "team_member", avatar_url: "" });
      fetchMembers();
    } catch (e: any) {
      alert("Gagal memproses data anggota: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditMemberModal = (member: any) => {
    setEditingMember(member);
    setMemberForm({
      full_name: member.v2_profiles?.full_name || "",
      email: member.v2_profiles?.email?.split('@')[0] || "",
      password: "", 
      role: member.role || "team_member",
      avatar_url: member.v2_profiles?.avatar_url || ""
    });
    setIsMemberModalOpen(true);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('v2_agency_content_plans')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      fetchContentPlans();
    } catch (e: any) {
      alert("Gagal update status: " + e.message);
    }
  };

  const TABS = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16}/> },
    { id: "roadmap", label: "Strategy", icon: <Target size={16}/> },
    { id: "content", label: "Content Plan", icon: <Layers size={16}/> },
    { id: "meetings", label: "Meeting Schedule", icon: <Video size={16}/> },
    ...(isAdmin ? [{ id: "members", label: "Manage Team", icon: <Users size={16}/> }] : [])
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"/>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Verifying Workspace Access...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 xl:p-10 space-y-8 max-w-[1700px] mx-auto min-h-screen">
      {/* Agency Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-6 px-10 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-[44px] text-white overflow-hidden relative shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"/>
       
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link href="/ruang-sosmed/agency" className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10 group">
                <ChevronRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform"/>
              </Link>
            )}
            <div className="px-3 py-1 rounded-full bg-white/20 text-white text-[9px] font-black uppercase tracking-widest border border-white/10">
              Agency Workspace
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4">
               {workspace?.name || "Loading Agency..."}
            </h1>
            <div className="flex flex-wrap gap-6 items-center opacity-70">
              <p className="flex items-center gap-2 text-sm font-bold"><Shield size={14}/> Registered Agency</p>
              <div className="h-1 w-1 rounded-full bg-white/30"/>
              <p className="flex items-center gap-2 text-sm font-bold"><Users size={14}/> {members.length}/10 Members Actives</p>
              <div className="h-1 w-1 rounded-full bg-white/30"/>
              <p className="flex items-center gap-2 text-sm font-bold"><Sparkles size={14}/> Shared Content Environment</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-end gap-6 self-stretch justify-between">
           {/* Identity Widget in Flow */}
           <div className="flex flex-col items-end gap-2 mt-0">
              {currentUserProfile && (
                 <div 
                    onClick={openMyProfileModal}
                    className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-1.5 pr-6 rounded-[32px] shadow-2xl hover:bg-white/20 transition-all cursor-pointer group"
                 >
                    <div className="w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
                       <img 
                          src={currentUserProfile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUserProfile.full_name}`} 
                          className="w-full h-full object-contain p-1 text-transparent"
                          alt="Avatar"
                       />
                    </div>
                    <div className="text-right">
                       <p className="text-[11px] font-black text-white italic leading-none truncate max-w-[120px]">{currentUserProfile.full_name}</p>
                       <p className="text-[8px] font-black text-white/60 uppercase tracking-widest mt-1.5">{userRole || 'Team Member'}</p>
                    </div>
                 </div>
              )}
              
              <div className="flex gap-2">
                 {isAdmin ? (
                   <div className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-tighter shadow-xl border border-emerald-400/50 flex items-center gap-1.5">
                      <ShieldCheck size={10}/> Authority Access
                   </div>
                 ) : (
                   <div className="px-3 py-1 rounded-full bg-white/10 text-white text-[8px] font-black uppercase tracking-tighter border border-white/20 flex items-center gap-1.5">
                      <Users size={10}/> Team Member
                   </div>
                 ) }
              </div>
           </div>

           <div className="flex gap-4 xl:mb-2">
           <Button 
             onClick={() => setIsTaskModalOpen(true)}
             className="h-14 px-8 rounded-2xl bg-white text-emerald-900 font-bold text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
           >
             <Plus size={18}/> New Content Task
           </Button>
           <Button 
             onClick={async () => {
               await supabase.auth.signOut();
               localStorage.removeItem("v2_legacy_admin");
               router.push("/ruang-sosmed/login");
             }}
             className="h-14 px-8 rounded-2xl bg-white/10 text-white font-bold text-sm border border-white/10 hover:bg-red-500/20 hover:text-red-200 transition-all flex items-center justify-center gap-2"
           >
             <LogOut size={18}/>
           </Button>
           {isAdmin && (
             <Button className="h-14 px-8 rounded-2xl bg-white/10 text-white font-bold text-sm border border-white/10 hover:bg-white/20 transition-all">
               <Settings size={18}/>
             </Button>
           )}
        </div>
      </div>
    </div>

      {/* Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex gap-4 p-2 bg-emerald-50/50 border border-emerald-100/50 rounded-3xl w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-8 py-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest transition-all ${activeTab === t.id ? "bg-white text-emerald-600 shadow-lg shadow-emerald-500/5 border border-emerald-100/50" : "text-slate-400 hover:text-emerald-700"}`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
           className="min-h-[500px]"
        >
          {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 {/* 1. Universal Stats Row */}
                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                       { label: "Strategic KPI", value: `${Math.round(roadmaps.reduce((acc: any, curr: any) => acc + curr.progress, 0) / (roadmaps.length || 1))}%`, icon: <Target className="text-emerald-500"/>, sub: "Goal progress" },
                       { label: "Production Line", value: contentPlans.length, icon: <Layers className="text-blue-500"/>, sub: "Active assets" },
                       { label: "Team Velocity", value: members.length, icon: <Users className="text-purple-500"/>, sub: "Collaborators" },
                       { label: "Pipeline Status", value: contentPlans.filter((c:any) => c.status === 'approved' || c.status === 'scheduled').length, icon: <Zap className="text-amber-500"/>, sub: "Ready to post" },
                    ].map((stat, i) => (
                       <Card key={i} className="p-6 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[32px] hover:scale-[1.02] transition-all">
                          <div className="flex items-center gap-4 mb-4">
                             <div className="p-3 bg-slate-50 rounded-2xl">{stat.icon}</div>
                             <div className="flex-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-[10px] font-bold text-slate-300 italic">{stat.sub}</p>
                             </div>
                          </div>
                          <h4 className="text-3xl font-black text-[#0F172A] italic">{stat.value}</h4>
                       </Card>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* 2. Critical Reminders & Focus */}
                    <div className="xl:col-span-2 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Next Meeting Reminder */}
                          <Card className="p-8 bg-white border border-slate-100 shadow-xl shadow-slate-100/50 rounded-[40px] relative overflow-hidden group">
                             <div className="absolute -left-1 w-2 h-full bg-emerald-500 top-0"/>
                             <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                   <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100 inline-flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"/>
                                      Live Sync Ready
                                   </div>
                                   <Video size={20} className="text-slate-300"/>
                                </div>
                                <div>
                                   <h4 className="text-2xl font-black text-[#0F172A] italic mb-1 line-clamp-1">
                                      {meetings.length > 0 ? meetings[0].title : 'No Pending Syncs'}
                                   </h4>
                                   <p className="text-slate-400 text-xs font-medium">
                                      {meetings.length > 0 ? new Date(meetings[0].start_time).toLocaleString('id-ID', { weekday: 'long', hour: '2-digit', minute: '2-digit' }) : 'Your schedule is clear.'}
                                   </p>
                                </div>
                                {meetings.length > 0 && meetings[0].meeting_link && (
                                   <Button 
                                     onClick={() => window.open(meetings[0].meeting_link, '_blank')}
                                     className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                   >
                                      Join Meeting
                                   </Button>
                                )}
                             </div>
                          </Card>

                          {/* Next Content Reminder */}
                          <Card className="p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[40px] space-y-6">
                             <div className="flex items-center justify-between">
                                <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100">Next Post Due</div>
                                <CalendarIcon size={20} className="text-slate-200"/>
                             </div>
                             <div>
                                <h4 className="text-xl font-black text-[#0F172A] italic mb-1 line-clamp-1">
                                   {contentPlans.filter(c => c.status !== 'published')[0]?.title || 'Buffer Empty'}
                                </h4>
                                <p className="text-slate-400 text-xs font-medium">
                                   {contentPlans.filter(c => c.status !== 'published')[0]?.due_date ? new Date(contentPlans.filter(c => c.status !== 'published')[0].due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) : 'Ready to strategize?'}
                                </p>
                             </div>
                             <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '45%' }}
                                  className="h-full bg-blue-500"
                                />
                             </div>
                          </Card>
                       </div>

                       {/* Agency Pulse: Integrated Workload & Recent Output Hub */}
                       <Card className="p-10 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[44px] space-y-8">
                          <div className="flex flex-col xl:flex-row gap-8">
                             {/* Workload Radar */}
                             <div className="flex-1 space-y-6">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2">
                                      <Zap size={20} className="text-amber-500 fill-amber-500"/>
                                      <h3 className="text-2xl font-black text-[#0F172A] italic">Workload Radar</h3>
                                   </div>
                                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest pl-7">Active Member Task Distribution</p>
                                </div>
                                <div className="space-y-4">
                                    {(() => {
                                        const pendingPlans = contentPlans.filter(c => c.status !== 'published');
                                        
                                        const workloads = members.map(m => {
                                           const tasks = pendingPlans.filter(c => c.created_by === m.profile_id);
                                           return { id: m.id, name: m.v2_profiles?.full_name || 'Member', avatar: m.v2_profiles?.avatar_url, activeTasks: tasks.length };
                                        }).filter(w => w.activeTasks > 0).sort((a,b) => b.activeTasks - a.activeTasks).slice(0,3);
                                        
                                        const unassignedTasks = pendingPlans.filter(c => !c.created_by);
                                        if (unassignedTasks.length > 0) {
                                           workloads.push({ id: 'system', name: 'Unassigned / System', avatar: '', activeTasks: unassignedTasks.length });
                                        }

                                        return workloads.length > 0 ? workloads.map(w => (
                                            <div key={w.id} className="flex items-center gap-4 group">
                                               <div className="w-10 h-10 rounded-[14px] bg-slate-50 border border-slate-100 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
                                                  <img src={w.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${w.name}`} className="w-full h-full object-contain p-1" alt="avatar"/>
                                               </div>
                                               <div className="flex-1">
                                                  <p className="text-sm font-bold text-[#0F172A]">{w.name}</p>
                                                  <p className="text-[10px] font-bold text-slate-400">Handling <span className="text-amber-600">{w.activeTasks}</span> pending actions</p>
                                               </div>
                                               <div className="h-2 flex-1 max-w-[80px] bg-slate-100 rounded-full overflow-hidden">
                                                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${Math.min(w.activeTasks * 20, 100)}%` }}/>
                                               </div>
                                            </div>
                                        )) : (
                                            <div className="p-6 text-center bg-slate-50 rounded-[24px] border border-slate-100/50">
                                               <Target size={24} className="mx-auto text-slate-300 mb-2"/>
                                               <p className="text-xs font-bold text-slate-400">All tasks cleared.</p>
                                            </div>
                                        );
                                    })()}
                                </div>
                             </div>
                             
                             {/* Recent Output */}
                             <div className="flex-1 space-y-6">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2">
                                      <Sparkles size={20} className="text-emerald-500 fill-emerald-50"/>
                                      <h3 className="text-2xl font-black text-[#0F172A] italic">Recent Output</h3>
                                   </div>
                                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest pl-7">Latest Content Movement</p>
                                </div>
                                <div className="space-y-4">
                                   {contentPlans.slice(0, 3).map(cp => (
                                      <div key={cp.id} className="flex gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-pointer">
                                         <div className={`w-10 h-10 rounded-[14px] bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${cp.platform === 'tiktok' ? 'text-[#0F172A]' : 'text-rose-500'}`}>
                                            {cp.platform === 'tiktok' ? <Play size={16} className="fill-current"/> : <Palette size={16}/>}
                                         </div>
                                         <div className="flex-1">
                                            <p className="text-xs font-bold text-slate-600 leading-tight">
                                               <span className="font-black text-[#0F172A]">{cp.creator?.full_name ? cp.creator.full_name.split(' ')[0] : 'System'}</span> updated <span className="italic truncate inline-flex max-w-[120px] ml-1 align-bottom">"{cp.title}"</span>
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                                               {cp.status.replace('_', ' ')} • {new Date(cp.created_at).toLocaleTimeString('id-id', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                         </div>
                                      </div>
                                   ))}
                                   {contentPlans.length === 0 && (
                                       <div className="p-6 text-center bg-slate-50 rounded-[24px] border border-slate-100/50">
                                          <LayoutDashboard size={24} className="mx-auto text-slate-300 mb-2"/>
                                          <p className="text-xs font-bold text-slate-400">No output recorded yet.</p>
                                       </div>
                                   )}
                                </div>
                             </div>
                          </div>
                       </Card>
                    </div>

                    {/* 3. Team Performance & Quick View */}
                    <div className="space-y-8">
                       <Card className="p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[40px] space-y-8">
                          <div className="space-y-1">
                             <h4 className="text-lg font-black text-[#0F172A] italic">Core Authorities</h4>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Collaborators</p>
                          </div>
                          <div className="space-y-6">
                             {members.slice(0, 5).map((m: any) => (
                                <div key={m.id} className="flex items-center gap-5 group">
                                   <div className="relative">
                                      <div className="w-14 h-14 rounded-[22px] bg-white overflow-hidden border border-slate-100 shadow-sm group-hover:scale-105 transition-all">
                                         <img 
                                            src={m.v2_profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${m.v2_profiles?.full_name}`} 
                                            className="w-full h-full object-contain p-2 relative z-10"
                                            alt={m.v2_profiles?.full_name}
                                         />
                                      </div>
                                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-[3px] border-white shadow-sm z-20"/>
                                   </div>
                                   <div className="flex-1 overflow-hidden">
                                      <p className="text-xs font-black text-[#0F172A] truncate italic">{m.v2_profiles?.full_name}</p>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{m.role || 'Authority'}</p>
                                   </div>
                                   <Link href="#" className="p-2 text-slate-200 hover:text-emerald-500 transition-colors"><MessageSquare size={14}/></Link>
                                </div>
                             ))}
                          </div>
                          <Button 
                             onClick={() => setActiveTab('members')}
                             className="w-full h-12 bg-slate-50 text-slate-500 hover:bg-emerald-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                          >
                             Manage Workspace Team
                          </Button>
                       </Card>

                       {/* Strategic Progress Widget */}
                       <Card className="p-8 bg-emerald-600 text-white rounded-[40px] shadow-2xl relative overflow-hidden group">
                          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-1000"/>
                          <div className="relative z-10 space-y-6">
                             <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-200">Current Phase Focus</p>
                                <h4 className="text-xl font-black italic">{roadmaps.find(r => r.status === 'in_progress')?.title || 'Next Strategy Ready'}</h4>
                             </div>
                             <div className="space-y-3">
                                {(() => {
                                   const activePhase = roadmaps.find(r => r.status === 'in_progress');
                                   if (!activePhase) return (
                                      <p className="text-[10px] font-bold text-emerald-200 italic opacity-50">Strategic landscape is clear for now.</p>
                                   );
                                   
                                   const isMember = activePhase.kpi_members?.some((km: any) => km.profile_id === currentUserProfile?.id);
                                   if (isMember) {
                                      const myMilestones = activePhase.milestones?.filter((m: any) => m.assigned_to === currentUserProfile?.id) || [];
                                      const myTotal = myMilestones.length;
                                      const myCompleted = myMilestones.filter((m: any) => m.is_completed).length;
                                      const myProgress = myTotal > 0 ? Math.round((myCompleted / myTotal) * 100) : 0;
                                      return (
                                         <div className="space-y-4">
                                            <div className="p-4 bg-white/10 rounded-2xl border border-white/5 shadow-inner">
                                               <div className="flex justify-between items-center mb-1">
                                                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-100">Your Actions</span>
                                                  <span className="text-sm font-black">{myProgress}%</span>
                                               </div>
                                               <div className="h-1.5 w-full bg-emerald-900/30 rounded-full overflow-hidden">
                                                  <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${myProgress}%` }}/>
                                               </div>
                                            </div>
                                            <div className="flex justify-between items-end">
                                               <div className="space-y-0.5">
                                                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100 italic">Total Force</p>
                                                  <p className="text-2xl font-black italic tracking-tighter">{activePhase.progress}%</p>
                                               </div>
                                               <Target size={20} className="text-emerald-300 opacity-50 mb-1"/>
                                            </div>
                                         </div>
                                      );
                                   }
                                   
                                   return (
                                      <>
                                         <div className="flex justify-between items-end">
                                            <p className="text-[32px] font-black italic">{activePhase.progress || 0}%</p>
                                            <Target size={24} className="text-emerald-300 opacity-50"/>
                                         </div>
                                         <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                                            <motion.div 
                                              initial={{ width: 0 }}
                                              animate={{ width: `${activePhase.progress || 0}%` }}
                                              className="h-full bg-white"
                                            />
                                         </div>
                                      </>
                                   );
                                })()}
                             </div>
                          </div>
                       </Card>
                    </div>
                 </div>
              </div>
           )}

          {activeTab === 'content' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="space-y-1">
                      <h3 className="text-3xl font-black text-[#0F172A] italic">Content Production Line</h3>
                      <p className="text-slate-400 text-sm font-medium italic">Manage your content lifecycle from strategy to publishing.</p>
                   </div>
                   
                   <div className="flex items-center gap-3 bg-slate-100/50 p-2 rounded-2xl border border-slate-100">
                      {[
                        { id: 'table', icon: <Table2 size={16}/> },
                        { id: 'kanban', icon: <Kanban size={16}/> },
                        { id: 'calendar', icon: <CalendarIcon size={16}/> }
                      ].map((v) => (
                        <button 
                          key={v.id}
                          onClick={() => setContentView(v.id as any)}
                          className={`p-3 rounded-xl transition-all ${contentView === v.id ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          {v.icon}
                        </button>
                      ))}
                      <div className="w-[1px] h-6 bg-slate-200 mx-1"/>
                      <Button onClick={() => setIsTaskModalOpen(true)} className="bg-emerald-600 text-white h-11 px-6 rounded-xl font-bold text-xs">
                        <Plus size={16} className="mr-2"/> New Content
                      </Button>
                   </div>
                </div>

                {contentView === 'table' && (
                   <Card className="p-0 border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden rounded-[40px]">
                      <div className="overflow-x-auto">
                         <table className="w-full">
                            <thead>
                               <tr className="bg-slate-50/50">
                                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Content / Pillar</th>
                                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Platform</th>
                                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Phase</th>
                                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Due Date</th>
                                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Assets</th>
                                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Live Link</th>
                                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                               </tr>
                            </thead>
                            <tbody>
                               {contentPlans.map((plan) => (
                                  <tr key={plan.id} className={`border-b border-slate-50 hover:bg-slate-50/30 transition-all relative ${plan.status === 'approved' ? 'bg-emerald-50/10' : ''}`}>
                                     <td className="px-8 py-6 relative">
                                        {plan.status === 'approved' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"/>}
                                        <div className="space-y-1">
                                           <p className="text-sm font-black text-[#0F172A] flex items-center gap-2">
                                              {plan.headline || plan.title}
                                              {plan.status === 'approved' && <ShieldCheck size={14} className="text-emerald-500 animate-pulse flex-shrink-0"/>}
                                           </p>
                                           <div className="flex items-center gap-2">
                                              <span className="text-[9px] font-black px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">{plan.content_pillar || 'No Pillar'}</span>
                                           </div>
                                        </div>
                                     </td>
                                     <td className="px-8 py-6">
                                        <span className="text-[10px] font-black uppercase text-slate-400">{plan.platform}</span>
                                     </td>
                                     <td className="px-8 py-6">
                                         <select 
                                           value={plan.status} 
                                           onChange={(e) => handleUpdateTaskStatus(plan.id, e.target.value)} 
                                           className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase w-fit border outline-none cursor-pointer hover:scale-105 transition-all appearance-none text-center ${ 
                                             plan.status === "approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :  
                                             plan.status === "review" ? "bg-amber-50 text-amber-600 border-amber-100" : 
                                             "bg-blue-50 text-blue-600 border-blue-100" 
                                           }`} 
                                         > 
                                           <option value="draft">Draft</option> 
                                           <option value="review">Review</option> 
                                           <option value="approved">Approved</option> 
                                         </select>
                                     </td>
                                     <td className="px-8 py-6 text-xs font-bold text-slate-600">
                                        {plan.due_date ? new Date(plan.due_date).toLocaleDateString() : '-'}
                                     </td>
                                     <td className="px-8 py-6">
                                        <div className="flex flex-wrap items-center gap-2">
                                           {plan.script_url && (
                                              <a href={plan.script_url} target="_blank" className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-all text-xs font-bold" title="Script">
                                                 <FileText size={14}/>
                                                 <span>Script</span>
                                              </a>
                                           )}
                                           {plan.result_url && (
                                              <a href={plan.result_url} target="_blank" className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-xs font-bold" title="Result Content">
                                                 <Video size={14}/>
                                                 <span>Konten</span>
                                              </a>
                                           )}
                                           {!plan.script_url && !plan.result_url && <span className="text-[10px] text-slate-300 font-bold italic">No Assets</span>}
                                        </div>
                                     </td>
                                     <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                           {plan.published_url ? (
                                              <a href={plan.published_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-[9px] hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                                                 <LinkIcon size={12}/> Link Post
                                              </a>
                                           ) : editingLinkId === plan.id ? (
                                              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                                 <input 
                                                   value={tempLinkValue}
                                                   onChange={(e) => setTempLinkValue(e.target.value)}
                                                   placeholder="Paste link..."
                                                   className="h-9 w-40 rounded-lg bg-slate-50 border border-slate-200 px-3 text-[10px] font-bold focus:outline-none ring-2 ring-emerald-500/10"
                                                 />
                                                 <button 
                                                    onClick={() => handleUpdatePostLink(plan.id, tempLinkValue)}
                                                    className="h-9 px-3 bg-emerald-600 text-white rounded-lg font-bold text-[9px] hover:bg-emerald-700 transition-all shrink-0"
                                                 >
                                                   Save
                                                 </button>
                                                 <button 
                                                    onClick={() => setEditingLinkId(null)}
                                                    className="p-2 text-slate-400 hover:text-red-500 transition-all"
                                                 >
                                                   <X size={14}/>
                                                 </button>
                                              </div>
                                           ) : (
                                              <button 
                                                onClick={() => { setEditingLinkId(plan.id); setTempLinkValue(""); }}
                                                className="px-4 py-2 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl font-bold text-[9px] hover:bg-slate-100 transition-all flex items-center gap-2"
                                              >
                                                <Plus size={10}/> Input Post Link
                                              </button>
                                           )}
                                        </div>
                                     </td>
                                     <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 text-slate-300">
                                           <button onClick={() => openEditModal(plan)} className="p-2 hover:bg-slate-100 hover:text-emerald-600 rounded-lg transition-all" title="Edit Content"><Settings size={16}/></button>
                                           <button onClick={() => { setTaskToDelete(plan); setIsDeleteModalOpen(true); }} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all" title="Delete"><Trash2 size={16}/></button>
                                        </div>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   </Card>
                )}

                {contentView === 'kanban' && (
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {['draft', 'review', 'approved'].map((status) => (
                         <div key={status} className="space-y-6">
                            <div className="flex items-center justify-between px-4">
                               <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${status === 'approved' ? 'bg-emerald-500' : status === 'review' ? 'bg-amber-500' : 'bg-blue-500'}`}/>
                                  <h4 className="text-sm font-black text-[#0F172A] uppercase tracking-widest">{status}</h4>
                               </div>
                               <span className="text-[10px] font-black text-slate-300 bg-slate-100 px-2 py-1 rounded-lg">
                                 {contentPlans.filter(p => p.status === status).length}
                               </span>
                            </div>
                            
                            <div className="space-y-4 min-h-[400px]">
                               {contentPlans.filter(p => p.status === status).map((plan) => (
                                  <Card key={plan.id} className="p-6 bg-white border border-slate-100 shadow-lg shadow-slate-200/50 rounded-3xl space-y-4 hover:border-emerald-200 transition-all cursor-grab active:cursor-grabbing">
                                     <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{plan.platform}</span>
                                        <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{plan.content_pillar || 'Default'}</span>
                                     </div>
                                     <h5 className="text-sm font-black text-[#0F172A] leading-snug">{plan.headline || plan.title}</h5>
                                     <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                         <div className="flex items-center gap-2"> 
                                            <div className="w-5 h-5 rounded-full bg-slate-50 border border-slate-200 overflow-hidden shadow-sm"> 
                                               <img 
                                                  src={plan.creator?.avatar_url || (currentUserProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${plan.creator?.full_name || (currentUserProfile?.full_name || "Main Authority")}`)} 
                                                  className="w-full h-full object-contain p-0.5" 
                                                  alt="Creator" 
                                               /> 
                                            </div> 
                                            <span className="text-[10px] font-bold text-slate-500 italic">{plan.creator?.full_name || (currentUserProfile?.full_name || "Main Authority")}</span> 
                                         </div>
                                        <span className="text-[9px] font-black text-slate-300 uppercase">{plan.due_date ? new Date(plan.due_date).toLocaleDateString() : '-'}</span>
                                     </div>
                                  </Card>
                               ))}
                            </div>
                         </div>
                      ))}
                   </div>
                )}

                {contentView === 'calendar' && (
                   <Card className="p-10 bg-white border-none shadow-xl shadow-slate-200/50 rounded-[44px]">
                      <div className="grid grid-cols-7 gap-2">
                         {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="py-4 text-center text-[10px] font-black uppercase text-slate-300 tracking-widest">{day}</div>
                         ))}
                         {Array.from({ length: 31 }).map((_, i) => {
                            const date = i + 1;
                            const plansOnThisDay = contentPlans.filter(p => p.due_date && new Date(p.due_date).getDate() === date);
                            return (
                               <div key={i} className="min-h-[120px] p-3 rounded-2xl bg-slate-50/50 border border-slate-50 hover:bg-slate-50 transition-all space-y-2">
                                  <span className="text-xs font-black text-slate-300">{date}</span>
                                  {plansOnThisDay.map(p => (
                                     <div key={p.id} className="p-2 bg-white border border-slate-100 shadow-sm rounded-lg text-[9px] font-bold text-slate-600 truncate">
                                        {p.title}
                                     </div>
                                  ))}
                               </div>
                            );
                         })}
                      </div>
                   </Card>
                )}

                {contentPlans.length === 0 && (
                   <div className="py-40 text-center space-y-6 bg-white rounded-[44px] border border-slate-50 shadow-sm">
                      <Layers size={60} className="mx-auto text-slate-100"/>
                      <div className="space-y-2">
                         <h3 className="text-xl font-black text-[#0F172A]">Belum Ada Antrean Konten</h3>
                         <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto italic">Mulai kolaborasi dengan menambahkan tugas konten pertama tim Anda.</p>
                      </div>
                   </div>
                )}
             </div>
          )}

          {activeTab === 'meetings' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                   <div>
                      <h2 className="text-3xl font-black text-[#0F172A]">Sync & Meetings</h2>
                      <p className="text-slate-500 text-sm font-medium mt-1">Jangan lewatkan kolaborasi tim dan sync client terdekat.</p>
                   </div>
                   <Button 
                      onClick={() => {
                        setEditingMeeting(null);
                        setMeetingForm({ title: "", description: "", start_time: "", end_time: "", meeting_link: "", category: "internal" });
                        setIsMeetingModalOpen(true);
                      }}
                      className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-sm shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                   >
                      <Video size={18}/> Schedule Sync
                   </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                   {meetings.length > 0 ? meetings.map((meeting) => {
                      const isLive = new Date() >= new Date(meeting.start_time) && new Date() <= new Date(meeting.end_time || new Date(new Date(meeting.start_time).getTime() + 3600000));
                      
                      return (
                         <Card key={meeting.id} className="p-8 border-none bg-white shadow-2xl shadow-slate-200/50 rounded-[40px] space-y-6 group hover:border-emerald-200 transition-all relative overflow-hidden">
                            {isLive && <div className="absolute top-0 right-0 px-6 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-3xl animate-pulse">Live Now</div>}
                            
                            <div className="flex items-start justify-between">
                               <div className={`p-4 rounded-2xl ${
                                  meeting.category === 'client' ? 'bg-blue-50 text-blue-600' : 
                                  meeting.category === 'review' ? 'bg-amber-50 text-amber-600' : 
                                  'bg-emerald-50 text-emerald-600'
                               }`}>
                                  {meeting.category === 'client' ? <Users size={24}/> : <Video size={24}/>}
                               </div>
                               <div className="flex gap-4">
                                  {isAdmin && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); openEditMeetingModal(meeting); }}
                                        className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                                      >
                                        <Edit size={14}/>
                                      </button>
                                      <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteMeeting(meeting.id); }}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                      >
                                        <Trash2 size={14}/>
                                      </button>
                                    </div>
                                  )}
                                  <div className="text-right">
                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{meeting.category}</p>
                                     <p className="text-sm font-black text-[#0F172A] mt-1">{new Date(meeting.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                               </div>
                            </div>

                            <div className="space-y-2">
                               <h3 className="text-lg font-black text-[#0F172A] leading-tight group-hover:text-emerald-600 transition-colors line-clamp-2">{meeting.title}</h3>
                               <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-2">{meeting.description || 'Agenda kolaborasi mingguan agensi.'}</p>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-100 p-1">
                                     <img 
                                        src={meeting.creator?.avatar_url || currentUserProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${meeting.creator?.full_name || (currentUserProfile?.full_name || 'A')}`} 
                                        className="w-full h-full object-contain" 
                                     />
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Organized by</span>
                                     <span className="text-[11px] font-bold text-[#0F172A] leading-none">
                                        {meeting.creator?.full_name || (currentUserProfile?.full_name || 'Main Authority')}
                                     </span>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2">
                                  {/* Attendee Avatars */}
                                  <div className="flex -space-x-2 mr-2">
                                     {(meeting.attendees || []).slice(0, 3).map((a: any) => (
                                        <div key={a.id} className="w-7 h-7 rounded-lg border-2 border-white bg-slate-50 overflow-hidden shadow-sm">
                                           <img src={a.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${a.profile?.full_name}`} className="w-full h-full object-contain" alt="attendee"/>
                                        </div>
                                     ))}
                                     {(meeting.attendees?.length || 0) > 3 && (
                                        <div className="w-7 h-7 rounded-lg border-2 border-white bg-slate-900 text-white flex items-center justify-center text-[8px] font-black">
                                           +{(meeting.attendees?.length || 0) - 3}
                                        </div>
                                     )}
                                  </div>
                                  {meeting.meeting_link && (
                                     <a 
                                        href={meeting.meeting_link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="h-10 px-4 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/10 text-[10px] font-black uppercase tracking-widest"
                                     >
                                        Join Meeting <ArrowUpRight size={14}/>
                                     </a>
                                  )}
                               </div>
                            </div>
                         </Card>
                      )
                   }) : (
                      <div className="col-span-full py-24 text-center space-y-6">
                         <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto">
                            <CalendarIcon size={40} className="text-slate-200"/>
                         </div>
                         <div className="space-y-2">
                            <h3 className="text-xl font-black text-[#0F172A]">Belum ada jadwal tersimpan</h3>
                            <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto italic">Tentukan koordinasi tim Anda dengan membuat jadwal sinkronisasi pertama.</p>
                         </div>
                         <Button 
                            onClick={() => {
                              setEditingMeeting(null);
                              setMeetingForm({ title: "", description: "", start_time: "", end_time: "", meeting_link: "", category: "internal" });
                              setIsMeetingModalOpen(true);
                            }}
                            className="bg-emerald-600 text-white h-14 px-10 rounded-2xl font-black shadow-xl shadow-emerald-500/20"
                         >
                            Schedule Now
                         </Button>
                      </div>
                   )}
                </div>
             </div>
          )}

          {activeTab === 'roadmap' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                       <h3 className="text-3xl font-black text-[#0F172A] italic">Strategic Roadmap</h3>
                       <p className="text-slate-400 text-sm font-medium italic">High-level strategic phases for this agency operations.</p>
                    </div>
                    {isAdmin && (
                      <Button onClick={() => setIsRoadmapModalOpen(true)} className="bg-slate-900 text-white h-14 px-8 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10">
                         <Plus size={18} className="mr-2"/> New Phase
                      </Button>
                    )}
                 </div>

                 {roadmaps.length === 0 ? (
                    <div className="py-20 text-center space-y-6">
                       <Target size={44} className="mx-auto text-slate-200"/>
                       <h3 className="text-xl font-black text-[#0F172A]">No Strategic Goals</h3>
                       {isAdmin && <Button onClick={() => setIsRoadmapModalOpen(true)} className="bg-emerald-500 text-white h-12 px-8 rounded-xl font-bold">Set First Goal</Button>}
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {roadmaps.map((phase) => (
                          <Card 
                            key={phase.id} 
                            onClick={() => setSelectedRoadmap(phase)}
                            className="p-6 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[40px] hover:border-emerald-500 transition-all cursor-pointer group relative overflow-hidden"
                          >
                             <div className="flex items-center justify-between mb-4">
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] ${
                                   phase.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                                   phase.status === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                                }`}>
                                   {phase.status.replace('_', ' ')}
                                </span>
                                <span className="text-[9px] font-black text-slate-300 uppercase italic">
                                   {phase.target_date ? new Date(phase.target_date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : 'PLAN'}
                                </span>
                             </div>

                             <h4 className="text-lg font-black text-[#0F172A] leading-tight mb-2 group-hover:text-emerald-600 transition-colors">{phase.title}</h4>
                             <p className="text-slate-400 text-[11px] font-medium line-clamp-2 mb-6">{phase.description}</p>

                             <div className="space-y-2 mt-auto">
                                <div className="flex items-center justify-between">
                                   <span className="text-[9px] font-black text-slate-300 uppercase">Growth Progress</span>
                                   <span className="text-[10px] font-black text-emerald-600">{phase.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                   <motion.div 
                                     initial={{ width: 0 }}
                                     animate={{ width: `${phase.progress}%` }}
                                     className={`h-full ${phase.status === 'completed' ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                                   />
                                </div>
                             </div>

                             <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                   <div className="w-2 h-2 rounded-full bg-slate-200"/>
                                   <span className="text-[10px] font-bold text-slate-400 italic">
                                      {phase.milestones?.filter((m:any) => m.is_completed).length || 0}/{phase.milestones?.length || 0} Milestones
                                   </span>
                                </div>
                                <div className="flex -space-x-2">
                                   {(phase.kpi_members || []).slice(0, 4).map((km: any) => (
                                      <div key={km.id} className="w-7 h-7 rounded-xl border-2 border-white bg-slate-50 overflow-hidden shadow-sm">
                                         <img src={km.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${km.profile?.full_name}`} className="w-full h-full object-contain" alt="member"/>
                                      </div>
                                   ))}
                                   {(phase.kpi_members?.length || 0) === 0 && (
                                      <span className="text-[9px] font-bold text-slate-300 italic">No members</span>
                                   )}
                                </div>
                             </div>
                          </Card>
                       ))}
                    </div>
                 )}
              </div>
           )}

          {activeTab === 'members' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                       <h3 className="text-3xl font-black text-[#0F172A] italic">Workspace Authorities</h3>
                       <p className="text-slate-400 text-sm font-medium italic">Control team access and assignment roles within this agency environment.</p>
                    </div>
                    {isAdmin && (
                      <Button onClick={() => setIsMemberModalOpen(true)} className="bg-slate-900 text-white h-14 px-8 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10">
                         <UserPlus size={18} className="mr-2"/> Invite New Authority
                      </Button>
                    )}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {members.map((member) => (
                      <Card 
                         key={member.id} 
                         onClick={() => isAdmin && openEditMemberModal(member)}
                         className={`p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[40px] space-y-6 group hover:border-emerald-200 transition-all relative overflow-hidden ${isAdmin ? 'cursor-pointer' : ''}`}
                      >
                         <div className="absolute top-0 right-0 p-6">
                            {member.v2_profiles?.role === 'owner' ? (
                               <ShieldCheck className="text-emerald-500" size={24}/>
                            ) : isAdmin ? (
                               <button 
                                 onClick={() => handleRemoveMember(member.id)}
                                 className="p-3 bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg shadow-red-500/10"
                               >
                                  <Trash2 size={16}/>
                               </button>
                            ) : null}
                         </div>

                         <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                               {member.v2_profiles?.avatar_url ? (
                                  <img src={member.v2_profiles.avatar_url} className="w-full h-full object-contain p-2" />
                               ) : (
                                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                     <User size={32}/>
                                  </div>
                               )}
                            </div>
                            <div className="space-y-1">
                               <h4 className="text-xl font-black text-[#0F172A] leading-tight">{member.v2_profiles?.full_name || "New Authority"}</h4>
                               <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded w-fit">{member.role || "Member"}</p>
                            </div>
                         </div>

                         <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div className="space-y-0.5">
                               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Linked Identity</p>
                               <p className="text-xs font-bold text-slate-500 truncate max-w-[150px]">{member.v2_profiles?.email || 'hidden.identity@ms'}</p>
                            </div>
                            <div className="flex gap-2">
                               <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">ACTIVE</div>
                            </div>
                         </div>
                      </Card>
                   ))}

                    {isAdmin && (
                      <button 
                         onClick={() => setIsMemberModalOpen(true)}
                         className="p-8 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center gap-4 hover:bg-slate-50 hover:border-emerald-300 transition-all group min-h-[250px]"
                      >
                         <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 group-hover:scale-110 transition-all shadow-sm">
                            <Plus size={24}/>
                         </div>
                         <div className="text-center">
                            <p className="text-sm font-black text-slate-400 group-hover:text-emerald-600 transition-colors">Expand Team Access</p>
                            <p className="text-[10px] font-medium text-slate-300">Bring more experts to this space</p>
                         </div>
                      </button>
                    )}
                </div>
             </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Task Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[44px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-emerald-50/30">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Production Workflow</p>
                  <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">New Content Task</h3>
                </div>
                <button onClick={() => setIsTaskModalOpen(false)} className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm border border-slate-100"><Plus size={24} className="rotate-45"/></button>
              </div>

              <div className="p-10 space-y-8 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                   <div className="space-y-2 col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">CONTENT HEADLINE</label>
                      <input 
                        value={taskForm.headline}
                        onChange={(e) => setTaskForm({ ...taskForm, headline: e.target.value, title: e.target.value })}
                        placeholder="Headline Konten yang menarik perhatian"
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-lg focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 shadow-inner"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">CONTENT PILLAR</label>
                      <input 
                        value={taskForm.content_pillar}
                        onChange={(e) => setTaskForm({ ...taskForm, content_pillar: e.target.value })}
                        placeholder="Educational, Sales, etc."
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">PLATFORM</label>
                      <select 
                        value={taskForm.platform}
                        onChange={(e) => setTaskForm({ ...taskForm, platform: e.target.value })}
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 appearance-none pointer-events-auto"
                      >
                         <option value="tiktok">TikTok</option>
                         <option value="instagram">Instagram</option>
                         <option value="linkedin">LinkedIn</option>
                         <option value="short">YouTube Shorts</option>
                      </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">POSTING DATE</label>
                      <input 
                        type="date"
                        value={taskForm.due_date}
                        onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">SCRIPT LINK (GDrive/Doc)</label>
                      <input 
                        value={taskForm.script_url}
                        onChange={(e) => setTaskForm({ ...taskForm, script_url: e.target.value })}
                        placeholder="https://docs.google.com/..."
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">CONTENT FILE (Raw/Result)</label>
                      <input 
                        value={taskForm.result_url}
                        onChange={(e) => setTaskForm({ ...taskForm, result_url: e.target.value })}
                        placeholder="Link file video/image"
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">LIVE POST LINK</label>
                      <input 
                        value={taskForm.published_url}
                        onChange={(e) => setTaskForm({ ...taskForm, published_url: e.target.value })}
                        placeholder="https://tiktok.com/..."
                        className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">BRIEF / DESCRIPTION</label>
                  <textarea 
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Tuliskan arahan konten di sini..."
                    className="w-full h-32 rounded-2xl bg-slate-50 p-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 resize-none"
                 />
                </div>
              </div>

              <div className="p-10 pt-4 bg-slate-50/50">
                <Button 
                  disabled={isSubmitting || !taskForm.title}
                  onClick={async () => {
                    if (editingTask) {
                       setIsSubmitting(true);
                       const { error } = await supabase.from('v2_agency_content_plans').update(taskForm).eq('id', editingTask.id);
                       if (!error) {
                          setIsTaskModalOpen(false);
                          setEditingTask(null);
                          fetchContentPlans();
                       } else {
                          alert(error.message);
                       }
                       setIsSubmitting(false);
                    } else {
                       handleCreateTask();
                    }
                  }}
                  className="w-full h-20 rounded-3xl bg-emerald-600 text-white font-black text-lg shadow-2xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : (editingTask ? "Update Content Plan" : "Create Content Task")}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Member Modal */}
      <AnimatePresence>
        {isMemberModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[44px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-slate-100"
            >
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 text-center">
                <h3 className="text-xl font-black text-[#0F172A] tracking-tight">{editingMember ? "Edit Team Member" : "Add Team Member"}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Workspace Expansion</p>
              </div>

              {editingMember && (
                <div className="px-8 pt-8 flex justify-center">
                   <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden shadow-sm">
                      <img 
                        src={memberForm.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${memberForm.full_name}`} 
                        className="w-full h-full object-contain"
                        alt="Preview"
                      />
                   </div>
                </div>
              )}

              <div className="p-8 space-y-6">
                 <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">FULL NAME</label>
                     <input 
                       value={memberForm.full_name}
                       onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })}
                       placeholder="Enter member's full name"
                       className="w-full h-14 rounded-xl bg-slate-50 px-6 font-bold text-xs focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">USERNAME (FOR LOGIN)</label>
                     <input 
                       value={memberForm.email}
                       onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                       placeholder="e.g. arunika"
                       className="w-full h-14 rounded-xl bg-slate-50 px-6 font-bold text-xs focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">PASSWORD</label>
                     <input 
                       type="text"
                       value={memberForm.password}
                       onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                       placeholder="Set temporary password"
                       className="w-full h-14 rounded-xl bg-slate-50 px-6 font-bold text-xs focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">ROLE/POSITION</label>
                     <input 
                       value={memberForm.role}
                       onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                       placeholder="e.g. Content Creator"
                       className="w-full h-14 rounded-xl bg-slate-50 px-6 font-bold text-xs focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                     />
                  </div>
               </div>

              <div className="p-8 pt-2">
                <div className="flex gap-4">
                   <Button onClick={() => setIsMemberModalOpen(false)} className="flex-1 h-14 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs hover:bg-slate-200 transition-all border-none">Cancel</Button>
                   <Button 
                      disabled={isSubmitting || !memberForm.email || (!editingMember && !memberForm.password) || !memberForm.full_name}
                      onClick={handleAddMember}
                      className="flex-[2] h-14 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                   >
                     {isSubmitting ? "Processing..." : (editingMember ? "Update Member" : "Confirm & Create")}
                   </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden p-10 space-y-8"
            >
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto">
                <AlertCircle className="text-red-500" size={40}/>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-[#0F172A]">Hapus Konten?</h3>
                <p className="text-slate-400 text-sm font-medium italic">
                  Yakin ingin menghapus <span className="text-slate-600 font-bold">"{taskToDelete?.headline || taskToDelete?.title}"</span>? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="h-16 rounded-2xl bg-slate-100 text-slate-500 font-black text-sm hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDeleteTask}
                  disabled={isSubmitting}
                  className="h-16 rounded-2xl bg-red-500 text-white font-black text-sm hover:bg-red-600 shadow-xl shadow-red-500/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal for New Member */}
      <AnimatePresence>
        {isSuccessModalOpen && successData && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[44px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-white/20"
            >
              <div className="p-10 pt-12 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                    <ShieldCheck size={28}/>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-[#0F172A] tracking-tight">Akun Berhasil Dibuat!</h3>
                  <p className="text-slate-400 text-sm font-medium italic px-4">
                    Akses untuk <span className="text-emerald-600 font-bold">{successData.full_name}</span> telah aktif. Silakan bagikan detail login ini.
                  </p>
                </div>
              </div>

              <div className="px-10 space-y-4">
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[32px] space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Sparkles size={64} className="text-slate-900"/>
                  </div>
                  
                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <span>Login Detail</span>
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Secure</span>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                         <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Username</p>
                            <p className="font-black text-[#0F172A]">{successData.username}</p>
                         </div>
                         <button 
                           onClick={() => {
                             navigator.clipboard.writeText(successData.username);
                             setCopying(true);
                             setTimeout(() => setCopying(false), 2000);
                           }}
                           className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-emerald-600"
                         >
                           <Copy size={16}/>
                         </button>
                      </div>

                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                         <div className="space-y-0.5">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Password</p>
                            <p className="font-black text-[#0F172A] font-mono tracking-widest">{successData.password}</p>
                         </div>
                         <button 
                           onClick={() => {
                             navigator.clipboard.writeText(successData.password);
                             setCopying(true);
                             setTimeout(() => setCopying(false), 2000);
                           }}
                           className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-emerald-600"
                         >
                           <Copy size={16}/>
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 pt-8 space-y-3">
                <Button 
                  onClick={() => {
                    const message = `Halo ${successData.full_name},\n\nAkun Ruang Sosmed kamu sudah aktif!\nBerikut detail login kamu:\n\nUsername: ${successData.username}\nPassword: ${successData.password}\n\nSilakan login di https://ruangsosmed.com/login\n\nSelamat berkarya!`;
                    navigator.clipboard.writeText(message);
                    setCopying(true);
                    setTimeout(() => setCopying(false), 2000);
                  }}
                  className="w-full h-16 rounded-2xl bg-[#075E54] hover:bg-[#128C7E] text-white font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
                >
                  {copying ? <Check size={18}/> : <MessageSquare size={18}/>}
                  {copying ? "Berhasil Disalin!" : "Salin Pesan WhatsApp"}
                </Button>
                
                <button 
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="w-full h-14 rounded-2xl bg-white text-slate-400 font-bold text-xs hover:text-slate-600 transition-all border border-slate-100"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* My Profile Modal */}
      <AnimatePresence>
        {/* Meeting Scheduler Modal */}
        {isMeetingModalOpen && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsMeetingModalOpen(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-xl bg-white rounded-[44px] shadow-2xl overflow-hidden"
             >
               <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                     <CalendarIcon size={24}/>
                   </div>
                   <div>
                     <h3 className="text-xl font-black text-[#0F172A]">{editingMeeting ? 'Edit Meeting Schedule' : 'Schedule Team Sync'}</h3>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Collab Scheduler</p>
                   </div>
                 </div>
                 <button onClick={() => setIsMeetingModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-all">
                   <X size={20}/>
                 </button>
               </div>

               <div className="p-10 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting Title</label>
                   <input 
                     type="text"
                     value={meetingForm.title}
                     onChange={(e) => setMeetingForm({...meetingForm, title: e.target.value})}
                     className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                     placeholder="e.g. Weekly Content Review"
                   />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                      <input 
                        type="datetime-local"
                        value={meetingForm.start_time}
                        onChange={(e) => setMeetingForm({...meetingForm, start_time: e.target.value})}
                        className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        value={meetingForm.category}
                        onChange={(e) => setMeetingForm({...meetingForm, category: e.target.value})}
                        className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                      >
                         <option value="internal">Internal Sync</option>
                         <option value="client">Client Meeting</option>
                         <option value="review">Content Review</option>
                      </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Meeting Link (Opt)</label>
                   <div className="relative">
                      <LinkIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300"/>
                      <input 
                        type="url"
                        value={meetingForm.meeting_link}
                        onChange={(e) => setMeetingForm({...meetingForm, meeting_link: e.target.value})}
                        className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="https://meet.google.com/xxx-xxxx-xxx"
                      />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agenda / Description</label>
                   <textarea 
                     value={meetingForm.description}
                     onChange={(e) => setMeetingForm({...meetingForm, description: e.target.value})}
                     className="w-full h-32 p-6 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                     placeholder="Tuliskan poin-poin bahasan meeting..."
                   />
                 </div>

                 <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invite Members</label>
                   <div className="flex flex-wrap gap-2">
                      {members.map((m: any) => {
                         const isInvited = selectedMeetingAttendeeIds.includes(m.profile_id);
                         return (
                            <button
                               key={m.id}
                               type="button"
                               onClick={() => {
                                  setSelectedMeetingAttendeeIds(prev => 
                                     isInvited ? prev.filter(id => id !== m.profile_id) : [...prev, m.profile_id]
                                  );
                               }}
                               className={`flex items-center gap-2 p-1.5 pr-4 rounded-xl border-2 transition-all ${
                                  isInvited ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-slate-50 border-transparent text-slate-400'
                                }`}
                            >
                               <div className="w-8 h-8 rounded-lg bg-white overflow-hidden shadow-sm">
                                  <img 
                                     src={m.v2_profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${m.v2_profiles?.full_name}`} 
                                     className="w-full h-full object-contain" 
                                     alt="avatar"
                                  />
                               </div>
                               <span className={`text-[10px] font-bold ${isInvited ? 'text-emerald-700' : 'text-slate-400'}`}>{m.v2_profiles?.full_name}</span>
                            </button>
                         );
                      })}
                   </div>
                 </div>
               </div>

               <div className="p-10 pt-0">
                 <Button 
                   disabled={isSubmitting || !meetingForm.title || !meetingForm.start_time}
                   onClick={handleCreateMeeting}
                   className="w-full h-16 rounded-2xl bg-slate-900 text-white font-black shadow-xl shadow-slate-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                 >
                   {isSubmitting ? "Scheduling..." : (editingMeeting ? "Save Changes" : "Create Schedule")}
                 </Button>
               </div>
             </motion.div>
           </div>
        )}

        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white rounded-[40px] shadow-2xl w-full ${isChoosingAvatar ? 'max-w-5xl' : 'max-w-lg'} transition-all duration-500 overflow-hidden flex flex-col border border-white/20`}
            >
              <div className="p-10 pb-6 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                    <User size={24}/>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Edit My Profile</h3>
                    <p className="text-slate-400 text-xs font-medium italic">Update your public identity details.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 transition-colors"
                >
                  <X size={20}/>
                </button>
              </div>

              <div className="p-10 space-y-8">
                 {isChoosingAvatar ? (
                    <div className="bg-slate-950 rounded-[40px] p-8">
                       <AvatarCreator 
                          initialName={profileForm.full_name}
                          onSave={(url) => {
                             setProfileForm({ ...profileForm, avatar_url: url });
                             setIsChoosingAvatar(false);
                          }}
                          onCancel={() => setIsChoosingAvatar(false)}
                       />
                    </div>
                 ) : (
                    <>
                       <div className="flex justify-center">
                          <button 
                            onClick={() => setIsChoosingAvatar(true)}
                            className="relative group cursor-pointer"
                          >
                             <div className="w-32 h-32 rounded-[40px] bg-slate-50 border-4 border-white shadow-xl overflow-hidden group-hover:scale-105 transition-transform">
                                <img 
                                  src={profileForm.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profileForm.full_name || 'A'}`} 
                                  className="w-full h-full object-contain p-3"
                                />
                             </div>
                             <div className="absolute -bottom-2 -right-2 p-3 bg-emerald-600 text-white rounded-2xl shadow-lg border-4 border-white group-hover:scale-110 transition-all">
                                <Palette size={16}/>
                             </div>
                          </button>
                       </div>

                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">FULL NAME</label>
                             <input 
                               value={profileForm.full_name}
                               onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                               className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                               placeholder="Your full name"
                             />
                          </div>

                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">AVATAR PREVIEW URL</label>
                             <input 
                               value={profileForm.avatar_url}
                               onChange={(e) => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                               className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100"
                               placeholder="https://image-url.com/..."
                             />
                          </div>

                          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                             <Shield size={16} className="text-amber-600 mt-1 flex-shrink-0"/>
                             <p className="text-[10px] font-medium text-amber-800 leading-relaxed italic">
                                Role/Jabatan Anda saat ini adalah <span className="font-bold">{userRole?.toUpperCase()}</span>. Hubungi Admin Utama jika Anda ingin melakukan perubahan akses level.
                             </p>
                          </div>
                       </div>
                    </>
                 )}
              </div>

              {!isChoosingAvatar && (
                 <div className="p-10 pt-0">
                   <Button 
                     disabled={isSubmitting || !profileForm.full_name}
                     onClick={handleUpdateMyProfile}
                     className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                   >
                     {isSubmitting ? "Updating..." : "Save Changes"}
                   </Button>
                 </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Roadmap Modal */}
      <AnimatePresence>
        {isRoadmapModalOpen && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-white/20"
            >
              <div className="p-10 pb-6 flex items-center justify-between border-b border-slate-50 bg-slate-900 text-white">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <Target size={24}/>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">New Strategy Phase</h3>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Milestone Creator</p>
                  </div>
                </div>
                <button onClick={() => setIsRoadmapModalOpen(false)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"><X size={20}/></button>
              </div>

              <div className="p-10 space-y-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Phase Title</label>
                       <input 
                         value={roadmapForm.title}
                         onChange={(e) => setRoadmapForm({ ...roadmapForm, title: e.target.value })}
                         placeholder="e.g. Foundation & Branding"
                         className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-slate-900/5 border border-slate-100"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Strategic Goal Details</label>
                       <textarea 
                         value={roadmapForm.description}
                         onChange={(e) => setRoadmapForm({ ...roadmapForm, description: e.target.value })}
                         placeholder="What are the main objectives of this phase?"
                         className="w-full min-h-[120px] rounded-2xl bg-slate-50 p-8 font-bold text-sm focus:outline-none focus:ring-4 ring-slate-900/5 border border-slate-100 resize-none"
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Target Date</label>
                           <input 
                             type="date"
                             value={roadmapForm.target_date}
                             onChange={(e) => setRoadmapForm({ ...roadmapForm, target_date: e.target.value })}
                             className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-slate-900/5 border border-slate-100"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Initial Progress</label>
                           <input 
                             type="number"
                             min="0"
                             max="100"
                             value={roadmapForm.progress}
                        onChange={(e) => setRoadmapForm({ ...roadmapForm, progress: parseInt(e.target.value) })}
                             className="w-full h-16 rounded-2xl bg-slate-50 px-8 font-bold text-sm focus:outline-none focus:ring-4 ring-slate-900/5 border border-slate-100"
                           />
                        </div>
                    </div>

                    {/* Member Picker */}
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Assign Team Members</label>
                       <div className="flex flex-wrap gap-3">
                          {members.map((m: any) => {
                             const isSelected = selectedRoadmapMemberIds.includes(m.profile_id);
                             return (
                                <button
                                   key={m.id}
                                   type="button"
                                   onClick={() => {
                                      setSelectedRoadmapMemberIds(prev => 
                                         isSelected 
                                            ? prev.filter(id => id !== m.profile_id)
                                            : [...prev, m.profile_id]
                                      );
                                   }}
                                   className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${
                                      isSelected 
                                         ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10' 
                                         : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                                   }`}
                                >
                                   <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 overflow-hidden">
                                      <img src={m.v2_profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${m.v2_profiles?.full_name}`} className="w-full h-full object-contain" alt="avatar"/>
                                   </div>
                                   <span className={`text-xs font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`}>
                                      {m.v2_profiles?.full_name || 'Member'}
                                   </span>
                                   {isSelected && <Check size={14} className="text-emerald-500"/>}
                                </button>
                             );
                          })}
                       </div>
                       {selectedRoadmapMemberIds.length > 0 && (
                          <p className="text-[10px] font-bold text-emerald-600 ml-2">{selectedRoadmapMemberIds.length} member(s) selected</p>
                       )}
                    </div>
                 </div>

                 <Button 
                   disabled={isSubmitting || !roadmapForm.title}
                   onClick={handleCreateRoadmap}
                   className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50 disabled:grayscale"
                 >
                   {isSubmitting ? "Sychronizing..." : "Initialize Phase"}
                 </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Roadmap Detail Drawer */}
      <AnimatePresence>
        {selectedRoadmap && (
           <div className="fixed inset-0 z-[200] flex justify-end">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedRoadmap(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-100"
              >
                 <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                          <Target size={24}/>
                       </div>
                       <div>
                          <h3 className="text-xl font-black text-[#0F172A] tracking-tight">{selectedRoadmap.title}</h3>
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">Strategic Objective Details</p>
                       </div>
                    </div>
                    <button onClick={() => setSelectedRoadmap(null)} className="p-3 bg-white rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all">
                       <X size={20}/>
                    </button>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                    {/* Status & Analytics */}
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Completion</p>
                          <p className="text-lg font-black text-[#0F172A]">{selectedRoadmap.target_date ? new Date(selectedRoadmap.target_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Flexible'}</p>
                       </div>
                       <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100/50">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Overall Progress</p>
                          <p className="text-2xl font-black text-emerald-600 italic">{selectedRoadmap.progress}%</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Strategic Brief</h5>
                       <div className="p-8 bg-emerald-50/30 border border-emerald-100/50 rounded-[40px]">
                          <p className="text-sm font-medium text-slate-600 leading-relaxed italic">"{selectedRoadmap.description}"</p>
                       </div>
                    </div>

                     {/* Per-Member Progress */}
                     {(selectedRoadmap.kpi_members?.length || 0) > 0 && (
                        <div className="space-y-5">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Member Contribution</h5>
                           <div className="space-y-3">
                              {selectedRoadmap.kpi_members?.map((km: any) => {
                                 const memberMilestones = selectedRoadmap.milestones?.filter((m: any) => m.assigned_to === km.profile_id) || [];
                                 const completedCount = memberMilestones.filter((m: any) => m.is_completed).length;
                                 const totalCount = memberMilestones.length;
                                 const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                                 
                                 return (
                                    <div key={km.id} className="flex items-center gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                       <div className="w-10 h-10 rounded-[14px] bg-white border border-slate-100 overflow-hidden shadow-sm">
                                          <img src={km.profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${km.profile?.full_name}`} className="w-full h-full object-contain p-0.5" alt="avatar"/>
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between mb-1">
                                             <p className="text-sm font-bold text-[#0F172A] truncate">{km.profile?.full_name || 'Member'}</p>
                                             <span className="text-[10px] font-black text-emerald-600">{percent}%</span>
                                          </div>
                                          <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                                             <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${percent}%` }}/>
                                          </div>
                                          <p className="text-[9px] font-bold text-slate-400 mt-1">{completedCount}/{totalCount} milestones completed</p>
                                       </div>
                                       {isAdmin && (
                                          <button
                                             onClick={() => handleRemoveKpiMember(selectedRoadmap.id, km.profile_id)}
                                             className="p-2 text-slate-200 hover:text-red-400 transition-colors"
                                          >
                                             <X size={14}/>
                                          </button>
                                       )}
                                    </div>
                                 );
                              })}
                           </div>
                        </div>
                     )}

                     {/* Add Members (Admin) */}
                     {isAdmin && (
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Manage Members</h5>
                           <div className="flex flex-wrap gap-2">
                              {members.filter((m: any) => !(selectedRoadmap.kpi_members || []).some((km: any) => km.profile_id === m.profile_id)).map((m: any) => (
                                 <button
                                    key={m.id}
                                    onClick={() => handleAddKpiMember(selectedRoadmap.id, m.profile_id)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all"
                                 >
                                    <div className="w-6 h-6 rounded-lg bg-white border overflow-hidden">
                                       <img src={m.v2_profiles?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${m.v2_profiles?.full_name}`} className="w-full h-full object-contain" alt="avatar"/>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{m.v2_profiles?.full_name}</span>
                                    <Plus size={12} className="text-slate-300"/>
                                 </button>
                              ))}
                              {members.filter((m: any) => !(selectedRoadmap.kpi_members || []).some((km: any) => km.profile_id === m.profile_id)).length === 0 && (
                                 <p className="text-[10px] font-bold text-slate-300 italic p-4">All members are assigned to this KPI.</p>
                              )}
                           </div>
                        </div>
                     )}

                     {/* Milestones Management */}
                    <div className="space-y-6">
                       <div className="flex items-center justify-between px-2">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Execution Checklist</h5>
                          <span className="text-[10px] font-bold text-slate-300 italic">{selectedRoadmap.milestones?.filter((m:any) => m.is_completed).length || 0}/{selectedRoadmap.milestones?.length || 0} Objectives</span>
                       </div>

                       <div className="space-y-3">
                          {selectedRoadmap.milestones?.map((m: any) => (
                             <div 
                                key={m.id}
                                className={`p-5 rounded-3xl border transition-all ${
                                  m.is_completed ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-slate-100 shadow-sm'
                                }`}
                              >
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                       <button 
                                         onClick={() => handleToggleMilestone(m.id, !m.is_completed, selectedRoadmap.id)}
                                         className={`w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all ${
                                           m.is_completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'border-slate-200 bg-white'
                                         }`}
                                       >
                                          {m.is_completed && <Check size={16} strokeWidth={4}/>}
                                       </button>
                                       <span className={`text-sm font-bold ${m.is_completed ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{m.title}</span>
                                    </div>
                                    {isAdmin && (
                                       <button 
                                         onClick={() => handleDeleteMilestone(m.id)}
                                         className="p-2 text-slate-200 hover:text-red-400 transition-colors"
                                       >
                                          <Trash2 size={16}/>
                                       </button>
                                    )}
                                 </div>
                                 {/* Assignee row */}
                                 <div className="mt-3 pl-11 flex items-center gap-2">
                                    {m.assignee ? (
                                       <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                                          <div className="w-5 h-5 rounded-lg bg-white border overflow-hidden">
                                             <img src={m.assignee.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${m.assignee.full_name}`} className="w-full h-full object-contain" alt="assignee"/>
                                          </div>
                                          <span className="text-[10px] font-bold text-slate-500">{m.assignee.full_name}</span>
                                          {isAdmin && (
                                             <button onClick={() => handleAssignMilestone(m.id, null)} className="text-slate-300 hover:text-red-400 transition-colors">
                                                <X size={10}/>
                                             </button>
                                          )}
                                       </div>
                                    ) : isAdmin ? (
                                       <select
                                          className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-400"
                                          value=""
                                          onChange={(e) => { if (e.target.value) handleAssignMilestone(m.id, e.target.value); }}
                                       >
                                          <option value="">Assign to...</option>
                                          {(selectedRoadmap.kpi_members || []).map((km: any) => (
                                             <option key={km.profile_id} value={km.profile_id}>{km.profile?.full_name}</option>
                                          ))}
                                       </select>
                                    ) : (
                                       <span className="text-[10px] font-bold text-slate-300 italic">Unassigned</span>
                                    )}
                                 </div>
                              </div>
                          ))}

                          {isAdmin && (
                             <div className="px-2">
                                <input 
                                  placeholder="Type new milestone & press Enter..."
                                  className="w-full h-14 px-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] text-sm font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                       handleAddMilestone(selectedRoadmap.id, (e.target as HTMLInputElement).value);
                                       (e.target as HTMLInputElement).value = '';
                                    }
                                  }}
                                />
                             </div>
                          )}
                       </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                       <div className="pt-10 border-t border-slate-100">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center mb-6">Zone Management</p>
                          <div className="grid grid-cols-2 gap-4">
                             <Button 
                               onClick={() => handleDeleteRoadmap(selectedRoadmap.id)}
                               className="h-14 bg-red-50 text-red-500 border border-red-100 rounded-2xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all"
                             >
                               Delete Strategy
                             </Button>
                             <div className="flex gap-2">
                                {['planned', 'in_progress', 'completed'].map((s) => (
                                   <button 
                                     key={s}
                                     onClick={() => handleUpdateRoadmapStatus(selectedRoadmap.id, s, s === 'completed' ? 100 : (s === 'planned' ? 0 : 50))}
                                     className={`flex-1 h-14 rounded-2xl text-[8px] font-black uppercase tracking-tighter transition-all ${
                                       selectedRoadmap.status === s ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                     }`}
                                   >
                                      {s.replace('_', ' ')}
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  );
}

