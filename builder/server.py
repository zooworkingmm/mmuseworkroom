#!/usr/bin/env python3
"""
포트폴리오 빌더용 로컬 서버.
- portfolio-site 폴더 전체를 정적으로 서빙 (option-a, option-b, builder, assets)
- POST /api/upload-image : 이미지 업로드 -> assets/images/<projectId>/ 에 리사이즈 저장
- POST /api/publish      : STUDIO/PROJECTS 데이터를 assets/data.js 로 저장

실행: python3 builder/server.py  (portfolio-site 폴더 어디서 실행해도 동작)
"""
import http.server
import json
import os
import re
import subprocess
import sys
import base64
import tempfile
import time
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # portfolio-site/
IMAGES_DIR = os.path.join(ROOT, "assets", "images")
DATA_JS = os.path.join(ROOT, "assets", "data.js")
SOURCE_DIR = "/Users/seolone/projects/portfolio"  # 사진을 정리해두는 원본 폴더
JOBS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "jobs")

IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".heic", ".tif", ".tiff", ".bmp")
VIDEO_EXTS = (".mp4", ".mov", ".m4v", ".webm")

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8934


def slugify(name):
    s = re.sub(r"[^a-zA-Z0-9]+", "-", name.strip().lower()).strip("-")
    return s or "project"


def prettify(name):
    return re.sub(r"[-_]+", " ", name).strip().upper()


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _send_json(self, obj, status=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b"{}"
        return json.loads(raw.decode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path.startswith("/api/scan-source"):
            try:
                self._handle_scan_source()
            except Exception as e:
                self._send_json({"error": str(e)}, 500)
            return
        if self.path.startswith("/api/generate-status"):
            try:
                self._handle_generate_status()
            except Exception as e:
                self._send_json({"error": str(e)}, 500)
            return
        super().do_GET()

    def do_POST(self):
        try:
            if self.path == "/api/upload-image":
                self._handle_upload_image()
            elif self.path == "/api/publish":
                self._handle_publish()
            elif self.path == "/api/import-folder":
                self._handle_import_folder()
            elif self.path == "/api/generate-request":
                self._handle_generate_request()
            elif self.path == "/api/update-caption":
                self._handle_update_caption()
            else:
                self._send_json({"error": "not found"}, 404)
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def _next_filename(self, project_dir, ext):
        existing = os.listdir(project_dir) if os.path.isdir(project_dir) else []
        next_n = len(existing) + 1
        while True:
            filename = "%02d%s" % (next_n, ext)
            if not os.path.exists(os.path.join(project_dir, filename)):
                return filename
            next_n += 1

    def _resize_image_into(self, src_path, project_dir):
        filename = self._next_filename(project_dir, ".jpg")
        dest = os.path.join(project_dir, filename)
        subprocess.run(
            [
                "sips", "-Z", "2000",
                "-s", "format", "jpeg",
                "-s", "formatOptions", "78",
                src_path, "--out", dest,
            ],
            check=True,
            capture_output=True,
        )
        return filename

    def _copy_video_into(self, src_path, project_dir):
        ext = os.path.splitext(src_path)[1].lower() or ".mp4"
        filename = self._next_filename(project_dir, ext)
        dest = os.path.join(project_dir, filename)
        with open(src_path, "rb") as fsrc, open(dest, "wb") as fdst:
            fdst.write(fsrc.read())
        return filename

    def _handle_upload_image(self):
        payload = self._read_json()
        project_id = slugify(payload.get("projectId", "project"))
        data_url = payload.get("dataUrl", "")
        m = re.match(r"^data:(image|video)/([\w+.-]+);base64,(.+)$", data_url, re.DOTALL)
        if not m:
            self._send_json({"error": "invalid dataUrl"}, 400)
            return
        kind, subtype, b64 = m.group(1), m.group(2), m.group(3)
        raw = base64.b64decode(b64)

        project_dir = os.path.join(IMAGES_DIR, project_id)
        os.makedirs(project_dir, exist_ok=True)

        suffix = "." + re.sub(r"[^a-zA-Z0-9]", "", subtype)
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(raw)
            tmp_path = tmp.name

        try:
            if kind == "video":
                filename = self._copy_video_into(tmp_path, project_dir)
            else:
                filename = self._resize_image_into(tmp_path, project_dir)
        finally:
            os.unlink(tmp_path)

        rel_path = "../assets/images/%s/%s" % (project_id, filename)
        self._send_json({"path": rel_path, "projectId": project_id, "type": kind})

    def _handle_scan_source(self):
        folders = []
        if os.path.isdir(SOURCE_DIR):
            for entry in sorted(os.listdir(SOURCE_DIR)):
                full = os.path.join(SOURCE_DIR, entry)
                if not os.path.isdir(full) or entry.startswith("."):
                    continue
                files = [f for f in os.listdir(full) if not f.startswith(".")]
                image_count = sum(1 for f in files if f.lower().endswith(IMAGE_EXTS))
                video_count = sum(1 for f in files if f.lower().endswith(VIDEO_EXTS))
                if image_count == 0 and video_count == 0:
                    continue
                folders.append({
                    "folder": entry,
                    "id": slugify(entry),
                    "name": prettify(entry),
                    "imageCount": image_count,
                    "videoCount": video_count,
                })
        self._send_json({"folders": folders})

    def _handle_import_folder(self):
        payload = self._read_json()
        folder_name = payload.get("folder", "")
        src_dir = os.path.join(SOURCE_DIR, folder_name)
        if not os.path.isdir(src_dir) or os.path.dirname(os.path.abspath(src_dir)) != SOURCE_DIR:
            self._send_json({"error": "folder not found"}, 400)
            return

        project_id = slugify(folder_name)
        project_dir = os.path.join(IMAGES_DIR, project_id)
        os.makedirs(project_dir, exist_ok=True)

        images = []
        for f in sorted(os.listdir(src_dir)):
            if f.startswith("."):
                continue
            src_path = os.path.join(src_dir, f)
            lower = f.lower()
            if lower.endswith(IMAGE_EXTS):
                filename = self._resize_image_into(src_path, project_dir)
                images.append({
                    "src": "../assets/images/%s/%s" % (project_id, filename),
                    "caption": "",
                    "cols": 1,
                })
            elif lower.endswith(VIDEO_EXTS):
                filename = self._copy_video_into(src_path, project_dir)
                images.append({
                    "src": "../assets/images/%s/%s" % (project_id, filename),
                    "caption": "",
                    "cols": 1,
                    "type": "video",
                })

        project = {
            "id": project_id,
            "name": prettify(folder_name),
            "type": "",
            "year": "",
            "location": "",
            "summary": "",
            "description": "",
            "facts": {
                "client": "", "site": "", "types": "", "topics": "",
                "design": "", "period": "", "periodCont": "", "workScope": "", "area": "",
            },
            "images": images,
        }
        self._send_json({"project": project})

    def _handle_publish(self):
        payload = self._read_json()
        studio = payload.get("studio", {})
        projects = payload.get("projects", [])
        commit_message = payload.get("commitMessage") or "Update portfolio data"

        self._write_data_js(studio, projects)
        git_result = self._git_publish(commit_message)
        self._send_json({"ok": True, "git": git_result})

    def _write_data_js(self, studio, projects):
        js = []
        js.append("/*")
        js.append("  포트폴리오 공용 데이터 파일")
        js.append("  - option-a, option-b, builder 가 함께 사용합니다.")
        js.append("  - builder/index.html 의 '발행' 버튼으로 자동 생성된 파일입니다.")
        js.append("*/")
        js.append("")
        js.append("const STUDIO = " + json.dumps(studio, ensure_ascii=False, indent=2) + ";")
        js.append("")
        js.append("const PROJECTS = " + json.dumps(projects, ensure_ascii=False, indent=2) + ";")
        js.append("")

        with open(DATA_JS, "w", encoding="utf-8") as f:
            f.write("\n".join(js))

    def _read_data_js(self):
        with open(DATA_JS, "r", encoding="utf-8") as f:
            text = f.read()
        m = re.search(r"const STUDIO = (\{.*?\});\s*const PROJECTS = (\[.*\]);", text, re.DOTALL)
        if not m:
            raise ValueError("data.js 형식을 읽을 수 없습니다")
        return json.loads(m.group(1)), json.loads(m.group(2))

    def _handle_update_caption(self):
        payload = self._read_json()
        project_id = payload.get("projectId", "")
        image_index = payload.get("imageIndex")
        caption = payload.get("caption", "")
        is_summary = bool(payload.get("isSummary"))

        studio, projects = self._read_data_js()
        project = next((p for p in projects if p.get("id") == project_id), None)
        if project is None:
            self._send_json({"error": "project not found"}, 404)
            return

        if is_summary:
            project["summary"] = caption
        else:
            images = project.get("images", [])
            if image_index is None or not (0 <= image_index < len(images)):
                self._send_json({"error": "invalid imageIndex"}, 400)
                return
            images[image_index]["caption"] = caption

        self._write_data_js(studio, projects)
        git_result = self._git_publish("Update caption: %s" % (project.get("name") or project_id))
        self._send_json({"ok": True, "git": git_result})

    def _run_git(self, args):
        return subprocess.run(
            ["git", "-C", ROOT] + args,
            capture_output=True,
            text=True,
        )

    def _git_publish(self, commit_message):
        if not os.path.isdir(os.path.join(ROOT, ".git")):
            return {"committed": False, "pushed": False, "note": "git 저장소가 아직 초기화되지 않았습니다"}

        add_res = self._run_git(["add", "-A"])
        if add_res.returncode != 0:
            return {"committed": False, "pushed": False, "note": "git add 실패: " + add_res.stderr.strip()}

        commit_res = self._run_git(["commit", "-m", commit_message])
        committed = commit_res.returncode == 0
        note = None
        if not committed:
            note = "커밋할 변경사항이 없습니다" if "nothing to commit" in (commit_res.stdout + commit_res.stderr) else commit_res.stderr.strip()

        remote_res = self._run_git(["remote"])
        has_remote = "origin" in remote_res.stdout.split()
        if not has_remote:
            return {"committed": committed, "pushed": False, "note": note or "origin 리모트가 설정되지 않았습니다"}

        push_res = self._run_git(["push", "origin", "HEAD"])
        pushed = push_res.returncode == 0
        push_note = None if pushed else push_res.stderr.strip()

        return {
            "committed": committed,
            "pushed": pushed,
            "note": note,
            "pushError": push_note,
        }

    def _job_path(self, project_id):
        return os.path.join(JOBS_DIR, "%s.json" % slugify(project_id))

    def _handle_generate_request(self):
        payload = self._read_json()
        project_id = payload.get("projectId", "")
        if not project_id:
            self._send_json({"error": "projectId required"}, 400)
            return
        os.makedirs(JOBS_DIR, exist_ok=True)
        job = {
            "status": "pending",
            "progress": 0,
            "step": "대기 중 — Claude Code 세션이 감지하면 시작됩니다",
            "projectId": project_id,
            "hints": payload.get("hints", {}),
            "requestedAt": time.time(),
        }
        with open(self._job_path(project_id), "w", encoding="utf-8") as f:
            json.dump(job, f, ensure_ascii=False, indent=2)
        self._send_json({"ok": True, "status": "pending"})

    def _handle_generate_status(self):
        qs = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(qs)
        project_id = (params.get("projectId") or [""])[0]
        if not project_id:
            self._send_json({"error": "projectId required"}, 400)
            return
        path = self._job_path(project_id)
        if not os.path.exists(path):
            self._send_json({"status": "none"})
            return
        with open(path, "r", encoding="utf-8") as f:
            job = json.load(f)
        self._send_json(job)


if __name__ == "__main__":
    os.chdir(ROOT)
    server = http.server.ThreadingHTTPServer(("localhost", PORT), Handler)
    print("Portfolio builder server: http://localhost:%d/builder/index.html" % PORT)
    server.serve_forever()
