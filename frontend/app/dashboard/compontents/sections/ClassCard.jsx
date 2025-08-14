import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar, FileText, Users } from "lucide-react"
import { useRouter } from "next/navigation"

function addOpacityToRgba(rgba, alpha) {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return rgba; 
  const [_, r, g, b] = match;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const ClassCard = ({ classItem, showStudents }) => {
  const router = useRouter();

  const handelonclick = (classid) => {
    if (!classid){
      console.error("Class ID is not defined");
      return;
    }
    
    // Debug the class item data
    console.log("🎨 ClassCard Navigation Debug:");
    console.log("  Class Item:", classItem);
    console.log("  Color:", classItem.color);
    console.log("  Color Type:", typeof classItem.color);
    
    // Ensure color is in proper hex format
    let safeColor = classItem.color || '#6366f1';
    
    // If color is rgba, convert to hex
    if (safeColor.startsWith('rgba') || safeColor.startsWith('rgb')) {
      // For now, use a fallback - you can implement rgba to hex conversion if needed
      safeColor = '#6366f1';
      console.log("  Converted RGBA to fallback hex:", safeColor);
    }
    
    const queryParams = new URLSearchParams({
      name: classItem.name || '',
      title: classItem.title || '',
      instructor: classItem.instructor || '',
      color: safeColor
    });
    
    console.log("  Query Params:", queryParams.toString());
    router.push(`dashboard/classes/${classItem.role}/${classid}?${queryParams.toString()}`)
  }

  return (
    <div onClick={() => handelonclick(classItem.id)} className='relative group'>
              <div
                className="absolute -inset-2.5 rounded-xl opacity-0 blur-sm group-hover:opacity-90 z-0 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #9333ea)",
                }}
              />
  <div className="relative bg-white rounded-lg shadow-md overflow-hidden group  hover:shadow-xl transition-all duration-200 transform hover:scale-105 ">
    
    <div
      className="h-24 flex items-center justify-between relative"
      style={{ backgroundColor: classItem.color }}
    >
      <div className="text-white text-center w-full">
        <div className="text-lg font-semibold">{classItem.title}</div>
        <div className="text-sm opacity-90">{classItem.instructor}</div>
        {classItem.name && <div className="text-base opacity-75 mt-1">{classItem.name}</div>}
      </div>
     <div className="absolute top-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center">
      <div
        style={{ backgroundColor: addOpacityToRgba(classItem.color, 0.4) }}
        className="w-10 h-10 rounded-full flex items-center justify-center"
      >
        <span className="text-xl font-bold text-black">{classItem.avatar}</span>
      </div>
    </div>

    </div>
     
    <div className="p-4 pt-8 bg-gray-80">
      <div className="min-h-[80px] flex flex-col justify-between">
        {classItem.assignments && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-base text-gray-600">
              <FileText className="h-5 w-5" />
              <span className="font-bold">
                {classItem.assignments} Assignment{classItem.assignments > 1 ? "s" : ""}
              </span>
            </div>
            {classItem.dueDate && (
              <div className="flex items-center gap-2 text-base text-gray-600">
                <Calendar className="h-5 w-5" />
                <span>{classItem.dueDate}</span>
              </div>
            )}
          </div>
        )}
        {showStudents && classItem.students && (
          <div className="flex items-center gap-2 text-base text-gray-600">
            <Users className="h-5 w-5" />
            <span className="font-bold">{classItem.students} Students</span>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center mt-4 pt-3 border-t">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <FileText className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Calendar className="h-5 w-5" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  </div>
  </div>
)}

export default ClassCard

