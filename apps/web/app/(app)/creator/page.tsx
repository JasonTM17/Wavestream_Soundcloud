import { BarChart3, Download, ShieldAlert, Upload } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function CreatorPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Plays", "182K", 68],
          ["Likes", "28K", 45],
          ["Reposts", "11K", 32],
          ["Comments", "4.8K", 24],
        ].map(([label, value, progress]) => (
          <Card key={label as string}>
            <CardHeader className="pb-0">
              <CardDescription>{label as string}</CardDescription>
              <CardTitle className="text-3xl">{value as string}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <Progress value={progress as number} />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upload track</CardTitle>
            <CardDescription>
              A safe creator form shell with validation-ready fields and future backend wiring.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="Track title" />
              </div>
              <div className="space-y-2">
                <Label>Genre</Label>
                <Input placeholder="Electronic, indie, ambient..." />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the track, collaborators, and release notes." />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 rounded-3xl border border-border/70 bg-background/70 p-4">
                <Label className="flex items-center justify-between">
                  Allow downloads
                  <Switch />
                </Label>
                <p className="mt-2 text-sm text-muted-foreground">
                  Give listeners a direct download option when the track is public.
                </p>
              </div>
              <div className="space-y-2 rounded-3xl border border-border/70 bg-background/70 p-4">
                <Label className="flex items-center justify-between">
                  Comments enabled
                  <Switch defaultChecked />
                </Label>
                <p className="mt-2 text-sm text-muted-foreground">
                  Keep the conversation open or lock it for private previews.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>
                <Upload className="h-4 w-4" />
                Add audio file
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                Add cover art
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Creator snapshot</CardTitle>
              <CardDescription>At-a-glance analytics and moderation-aware workflow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Top track</p>
                    <p className="text-sm text-muted-foreground">Night Drift</p>
                  </div>
                  <Badge variant="soft">+18% this week</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  <Progress value={82} />
                  <p className="text-sm text-muted-foreground">
                    14K plays in the last 7 days and climbing.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Moderation hooks</p>
                    <p className="text-sm text-muted-foreground">
                      Report state, safe delete flows, and audit trails are ready for backend wiring.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Analytics ready</p>
                    <p className="text-sm text-muted-foreground">
                      Total plays, likes, reposts, comments, and top listeners can be plugged in next.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
