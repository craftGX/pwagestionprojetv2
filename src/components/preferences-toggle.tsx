"use client";

import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export default function PreferencesToggle({ value, onChange }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-end gap-1"
    >
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-500">Mode compact</span>
        <Switch checked={value} onCheckedChange={(checked) => onChange(Boolean(checked))} />
      </div>
      <span className="text-[10px] text-slate-400">Préférence stockée localement</span>
    </motion.div>
  );
}
