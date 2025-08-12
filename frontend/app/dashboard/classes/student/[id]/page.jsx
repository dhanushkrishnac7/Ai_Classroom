import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Stream from "./com/stream"
import People from "./com/people"
import Classwork from "./com/classwork"


function Page() {
    return (
    <div className="p-6">
      <Tabs defaultValue="stream" className="flex flex-col items-center space-y-4">
        <TabsList className="flex space-x-1 bg-white rounded-lg p-1">
          <TabsTrigger
            value="stream"
            className="px-8 py-4 text-sm font-medium rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=inactive]:text-gray-600 hover:bg-purple-100 transition"
          >
            Stream
          </TabsTrigger>
          <TabsTrigger
            value="classwork"
            className="px-8 py-4 text-sm font-medium rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=inactive]:text-gray-600 hover:bg-purple-100 transition"
          >
            Classwork
          </TabsTrigger>
          <TabsTrigger
            value="people"
             className="px-8 py-4 text-sm font-medium rounded-md data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=inactive]:text-gray-600 hover:bg-purple-100 transition"                            
          >
            People
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stream" className="w-full max-w-4xl">
          <Stream/>
        </TabsContent>

        <TabsContent value="classwork" className="w-full max-w-4xl">
          <Classwork/>
        </TabsContent>

        <TabsContent value="people" className="w-full max-w-4xl">
          <People/>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Page
