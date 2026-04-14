#!/usr/bin/env zsh
set -euo pipefail
setopt pipefail no_nomatch

TASKS_FILE="${TASKS_FILE:-tasks.json}"
PROGRESS_FILE="${PROGRESS_FILE:-progress.md}"
MAX_AGENT_ATTEMPTS="${MAX_AGENT_ATTEMPTS:-4}"
MAX_ITERATIONS="${MAX_ITERATIONS:-200}"
AGENT_CMD="${AGENT_CMD:-codex}"

: "${lint_cmd:?Переменная lint_cmd не задана}"
: "${test_cmd:?Переменная test_cmd не задана}"

validate_tasks_json() {
    python3 - "$TASKS_FILE" <<'PY'
import json
import sys

path = sys.argv[1]

try:
    with open(path, "r", encoding="utf-8") as f:
        json.load(f)
except FileNotFoundError:
    print(f"Файл не найден: {path}", file=sys.stderr)
    raise SystemExit(1)
except json.JSONDecodeError as e:
    print(f"Некорректный JSON в {path}: {e}", file=sys.stderr)
    raise SystemExit(1)
except Exception as e:
    print(f"Ошибка чтения {path}: {e}", file=sys.stderr)
    raise SystemExit(1)
PY
}

json_status_count() {
    local wanted_status="$1"

    python3 - "$TASKS_FILE" "$wanted_status" <<'PY'
import json
import sys

path = sys.argv[1]
wanted = sys.argv[2]

try:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
except FileNotFoundError:
    print(f"Файл не найден: {path}", file=sys.stderr)
    raise SystemExit(1)
except json.JSONDecodeError as e:
    print(f"Некорректный JSON в {path}: {e}", file=sys.stderr)
    raise SystemExit(1)
except Exception as e:
    print(f"Ошибка чтения {path}: {e}", file=sys.stderr)
    raise SystemExit(1)

count = 0

def is_task_object(node):
    if not isinstance(node, dict):
        return False
    if "status" not in node:
        return False

    task_like_keys = {
        "title", "name", "description", "summary",
        "id", "task", "feature", "priority", "estimate"
    }

    if node.get("type") == "task":
        return True

    return any(key in node for key in task_like_keys)

def walk(node):
    global count

    if isinstance(node, dict):
        if is_task_object(node) and node.get("status") == wanted:
            count += 1
        for value in node.values():
            walk(value)
    elif isinstance(node, list):
        for item in node:
            walk(item)

walk(data)
print(count)
PY
}

get_task_status() {
    local task_id="$1"

    python3 - "$TASKS_FILE" "$task_id" <<'PY'
import json
import sys

path = sys.argv[1]
task_id = sys.argv[2]

with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

for task in data.get("tasks", []):
    if task.get("id") == task_id:
        print(task.get("status", ""))
        raise SystemExit(0)

print(f"Задача не найдена: {task_id}", file=sys.stderr)
raise SystemExit(1)
PY
}

set_task_status() {
    local task_id="$1"
    local new_status="$2"

    python3 - "$TASKS_FILE" "$task_id" "$new_status" <<'PY'
import json
import sys

path = sys.argv[1]
task_id = sys.argv[2]
new_status = sys.argv[3]

with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

for task in data.get("tasks", []):
    if task.get("id") == task_id:
        task["status"] = new_status
        break
else:
    print(f"Задача не найдена: {task_id}", file=sys.stderr)
    raise SystemExit(1)

with open(path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")
PY
}

pick_next_task() {
    python3 - "$TASKS_FILE" <<'PY'
import json
import re
import sys

path = sys.argv[1]

with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

tasks = data.get("tasks", [])
status_by_id = {task.get("id"): task.get("status") for task in tasks}

priority_order = {
    "critical": 0,
    "high": 1,
    "medium": 2,
    "low": 3,
}
category_order = {
    "infrastructure": 0,
    "security": 1,
    "functional": 2,
    "integration": 3,
    "ui": 4,
}

ready = []

for task in tasks:
    if task.get("status") != "pending":
        continue

    deps = task.get("dependencies", []) or []
    unmet = [dep for dep in deps if status_by_id.get(dep) != "done"]
    if unmet:
        continue

    ready.append(task)

ready.sort(
    key=lambda t: (
        priority_order.get(t.get("priority"), 999),
        category_order.get(t.get("category"), 999),
        t.get("id", ""),
    )
)

if not ready:
    raise SystemExit(0)

task = ready[0]
desc = re.sub(r"\s+", " ", task.get("description", "")).strip()

print("\t".join([
    task.get("id", ""),
    task.get("priority", ""),
    task.get("category", ""),
    desc,
]))
PY
}

get_task_payload() {
    local task_id="$1"

    python3 - "$TASKS_FILE" "$task_id" <<'PY'
import json
import sys

path = sys.argv[1]
task_id = sys.argv[2]

with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

for task in data.get("tasks", []):
    if task.get("id") == task_id:
        print(json.dumps(task, ensure_ascii=False, indent=2))
        raise SystemExit(0)

print(f"Задача не найдена: {task_id}", file=sys.stderr)
raise SystemExit(1)
PY
}

report_blocked_tasks() {
    python3 - "$TASKS_FILE" <<'PY'
import json
import sys

path = sys.argv[1]

with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

tasks = data.get("tasks", [])
status_by_id = {task.get("id"): task.get("status") for task in tasks}

blocked = []

for task in tasks:
    if task.get("status") != "pending":
        continue
    deps = task.get("dependencies", []) or []
    unmet = [dep for dep in deps if status_by_id.get(dep) != "done"]
    if unmet:
        blocked.append((task.get("id"), unmet))

if not blocked:
    print("Нет ready pending-задач и нет blocked-задач.")
else:
    for task_id, unmet in blocked:
        print(f"{task_id}: ждёт {', '.join(unmet)}")
PY
}

append_progress_note() {
    local task_id="$1"
    local note="$2"
    local now=""
    now="$(date '+%Y-%m-%d %H:%M:%S')"

    {
        echo "## $task_id [$now]"
        echo "$note"
        echo
    } >> "$PROGRESS_FILE"
}

tail_log() {
    local file="$1"
    python3 - "$file" <<'PY'
import re
import sys

path = sys.argv[1]

try:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
except FileNotFoundError:
    raise SystemExit(0)

content = re.sub(r"\x1b\[[0-9;?]*[ -/]*[@-~]", "", content)
content = content.replace("\r", "\n")
lines = content.splitlines()
print("\n".join(lines[-80:]))
PY
}

log_has_complete() {
    local file="$1"

    python3 - "$file" <<'PY'
import sys

path = sys.argv[1]

try:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
except FileNotFoundError:
    raise SystemExit(1)

content = content.replace("\r", "\n")

if "<promise>COMPLETE</promise>" in content:
    raise SystemExit(0)

raise SystemExit(1)
PY
}

run_shell_cmd() {
    local cmd="$1"
    local log_file="$2"
    local rc=0

    echo ">>> $cmd"

    set +e
    eval "$cmd" 2>&1 | tee "$log_file"
    rc=$?
    set -e

    return "$rc"
}

run_agent() {
    local prompt="$1"
    local log_file="$2"
    local prompt_file=""
    local wrapper_file=""
    local rc=0

    prompt_file="$(mktemp)"
    wrapper_file="$(mktemp)"

    print -r -- "$prompt" > "$prompt_file"

    cat > "$wrapper_file" <<EOF
#!/usr/bin/env zsh
set -euo pipefail
exec ${AGENT_CMD} "\$(cat "$prompt_file")"
EOF

    chmod +x "$wrapper_file"

    set +e
    {
        echo ">>> AGENT: ${AGENT_CMD}"
        script -qefc "$wrapper_file" /dev/null
    } 2>&1 | tee "$log_file"
    rc=$?
    set -e

    rm -f "$prompt_file" "$wrapper_file"

    return "$rc"
}

ensure_commit_for_task() {
    local task_id="$1"
    local task_description="$2"
    local before_head="$3"
    local after_head=""
    local short_desc=""

    after_head="$(git rev-parse --verify HEAD 2>/dev/null || echo "NO_HEAD")"

    if [[ "$after_head" != "$before_head" ]]; then
        return 0
    fi

    if [[ -n "$(git status --porcelain)" ]]; then
        short_desc="$task_description"
        short_desc="${short_desc//$'\n'/ }"
        short_desc="${short_desc//$'\t'/ }"
        short_desc="${short_desc[1,72]}"
        [[ -n "$short_desc" ]] || short_desc="complete task"

        git add -A
        git commit -m "feat(${task_id}): ${short_desc}"
    fi
}

build_agent_prompt() {
    local task_id="$1"
    local extra_feedback="${2:-}"
    local task_payload=""
    task_payload="$(get_task_payload "$task_id")"

    cat <<EOF
Ты работаешь в уже подготовленной среде внутри текущего git-репозитория.

Используй текущий shell и текущий PATH.
Не объясняй проблемы окружения.
Работай в уже активированной среде.

Твоя задача на эту сессию: выполнить ровно одну задачу:
$task_id

Данные задачи:
$task_payload

Правила:
1. Работай только над этой задачей: $task_id
2. Перед началом прочитай tasks.json и git log --oneline -20
3. Проверь зависимости задачи
4. После изменений прогони '$lint_cmd'
5. После изменений прогони '$test_cmd'
6. Обнови статус задачи только если test_steps реально пройдены
7. Добавь заметку в $PROGRESS_FILE
8. Сделай git commit только по этой задаче
9. Не трогай несвязанный код
10. Если команда падает, исправь причину и повтори в этой же попытке

Если задача полностью выполнена:
- выставь status=done
- обнови $PROGRESS_FILE
- сделай git commit
- в самом конце выведи строго: <promise>COMPLETE</promise>

$extra_feedback
EOF
}

[[ -f "$TASKS_FILE" ]] || {
    echo "Файл не найден: $TASKS_FILE" >&2
    exit 1
}

[[ -f "$PROGRESS_FILE" ]] || : > "$PROGRESS_FILE"

if ! command -v "$AGENT_CMD" >/dev/null 2>&1; then
    echo "Команда агента не найдена: $AGENT_CMD" >&2
    exit 1
fi

if ! command -v script >/dev/null 2>&1; then
    echo "Команда 'script' не найдена. Установи util-linux." >&2
    exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "Текущая директория не является git-репозиторием" >&2
    exit 1
fi

validate_tasks_json

if [[ -n "$(git status --porcelain)" ]]; then
    echo "Предупреждение: working tree не пустой. Коммиты будут включать текущие изменения."
fi

iteration=0

while true; do
    (( iteration += 1 ))

    if (( iteration > MAX_ITERATIONS )); then
        echo "Достигнут лимит итераций: $MAX_ITERATIONS" >&2
        exit 1
    fi

    validate_tasks_json

    pending="$(json_status_count pending)"
    done_count="$(json_status_count done)"

    if [[ "$pending" == "0" ]]; then
        echo "Все задачи завершены. done=$done_count"
        echo "<promise>COMPLETE</promise>"
        exit 0
    fi

    task_line="$(pick_next_task || true)"

    if [[ -z "$task_line" ]]; then
        echo "Нет ready pending-задач. Остались только blocked:"
        report_blocked_tasks
        exit 1
    fi

    task_id=""
    task_priority=""
    task_category=""
    task_description=""

    IFS=$'\t' read -r task_id task_priority task_category task_description <<< "$task_line"

    echo
    echo "=================================="
    echo "Итерация: $iteration"
    echo "Задача:   $task_id"
    echo "Priority: $task_priority"
    echo "Category: $task_category"
    echo "Done:     $done_count"
    echo "Pending:  $pending"
    echo "=================================="
    echo

    attempt=1
    task_completed=0
    feedback=""

    while (( attempt <= MAX_AGENT_ATTEMPTS )); do
        echo "--- Попытка $attempt/$MAX_AGENT_ATTEMPTS для $task_id ---"

        before_head="$(git rev-parse --verify HEAD 2>/dev/null || echo "NO_HEAD")"

        tasks_backup="$(mktemp)"
        progress_backup="$(mktemp)"
        cp "$TASKS_FILE" "$tasks_backup"
        cp "$PROGRESS_FILE" "$progress_backup" 2>/dev/null || : > "$progress_backup"

        agent_log="$(mktemp)"
        prompt="$(build_agent_prompt "$task_id" "$feedback")"

        agent_rc=0
        run_agent "$prompt" "$agent_log" || agent_rc=$?

        if (( agent_rc != 0 )); then
            set_task_status "$task_id" "pending" || true
            feedback=$'Предыдущий запуск агента завершился с ошибкой.\nИсправь причину и продолжай только эту задачу.\n'
            feedback+=$'\nПоследний вывод:\n'
            feedback+="$(tail_log "$agent_log")"
            (( attempt += 1 ))
            rm -f "$agent_log" "$tasks_backup" "$progress_backup"
            continue
        fi

        if ! validate_tasks_json; then
            echo "tasks.json повреждён, откатываю из backup"
            cp "$tasks_backup" "$TASKS_FILE"
            feedback=$'Предыдущий запуск сломал tasks.json.\nИсправь только текущую задачу и сохрани валидный JSON.\n'
            (( attempt += 1 ))
            rm -f "$agent_log" "$tasks_backup" "$progress_backup"
            continue
        fi

        [[ -f "$PROGRESS_FILE" ]] || cp "$progress_backup" "$PROGRESS_FILE"

        task_status="$(get_task_status "$task_id")"
        promise_seen=0
        log_has_complete "$agent_log" && promise_seen=1

        if [[ "$task_status" != "done" && "$promise_seen" != "1" ]]; then
            set_task_status "$task_id" "pending" || true
            feedback=$'Задача ещё не завершена: status != done и COMPLETE не выведен.\nПродолжай только эту задачу.\n'
            (( attempt += 1 ))
            rm -f "$agent_log" "$tasks_backup" "$progress_backup"
            continue
        fi

        lint_log="$(mktemp)"
        lint_rc=0
        run_shell_cmd "$lint_cmd" "$lint_log" || lint_rc=$?

        if (( lint_rc != 0 )); then
            set_task_status "$task_id" "pending" || true
            feedback=$'После изменений lint не проходит.\nИсправь причину и снова заверши только текущую задачу.\n'
            feedback+=$'\nЛоги lint:\n'
            feedback+="$(tail_log "$lint_log")"
            (( attempt += 1 ))
            rm -f "$agent_log" "$tasks_backup" "$progress_backup" "$lint_log"
            continue
        fi

        test_log="$(mktemp)"
        test_rc=0
        run_shell_cmd "$test_cmd" "$test_log" || test_rc=$?

        if (( test_rc != 0 )); then
            set_task_status "$task_id" "pending" || true
            feedback=$'После изменений тесты не проходят.\nИсправь причину и снова заверши только текущую задачу.\n'
            feedback+=$'\nЛоги тестов:\n'
            feedback+="$(tail_log "$test_log")"
            (( attempt += 1 ))
            rm -f "$agent_log" "$tasks_backup" "$progress_backup" "$lint_log" "$test_log"
            continue
        fi

        if [[ "$(get_task_status "$task_id")" != "done" ]]; then
            set_task_status "$task_id" "done"
        fi

        append_progress_note \
            "$task_id" \
            "- Авто-заметка цикла: задача прошла lint/tests и была завершена."

        ensure_commit_for_task "$task_id" "$task_description" "$before_head"

        echo "Задача $task_id завершена."
        task_completed=1

        rm -f "$agent_log" "$tasks_backup" "$progress_backup" "$lint_log" "$test_log"
        break
    done

    if (( task_completed != 1 )); then
        echo "Не удалось завершить задачу $task_id за $MAX_AGENT_ATTEMPTS попыток" >&2
        exit 1
    fi
done
