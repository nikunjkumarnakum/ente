import "dart:typed_data";

import "package:photos/models/ml/clip.dart";
import "package:photos/models/ml/face/face.dart";
import "package:photos/models/ml/vector.dart";
import "package:photos/services/machine_learning/face_ml/face_clustering/face_db_info_for_clustering.dart";

abstract class IMLDataDB {
  Future<void> bulkInsertFaces(List<Face> faces);
  Future<void> updateFaceIdToClusterId(Map<String, String> faceIDToClusterID);
  Future<Map<int, int>> faceIndexedFileIds({int minimumMlVersion});
  Future<int> getFaceIndexedFileCount({int minimumMlVersion});
  Future<Map<String, int>> clusterIdToFaceCount();
  Future<Set<String>> getPersonIgnoredClusters(String personID);
  Future<Set<String>> getPersonClusterIDs(String personID);
  Future<Set<String>> getPersonsClusterIDs(List<String> personID);
  Future<void> clearTable();
  Future<Iterable<Uint8List>> getFaceEmbeddingsForCluster(
    String clusterID, {
    int? limit,
  });
  Future<Map<String, Iterable<Uint8List>>> getFaceEmbeddingsForClusters(
    Iterable<String> clusterIDs, {
    int? limit,
  });
  Future<Face?> getCoverFaceForPerson({
    required int recentFileID,
    String? personID,
    String? avatarFaceId,
    String? clusterID,
  });
  Future<List<Face>?> getFacesForGivenFileID(int fileUploadID);
  Future<Map<String, Iterable<String>>> getClusterToFaceIDs(
    Set<String> clusterIDs,
  );
  Future<String?> getClusterIDForFaceID(String faceID);
  Future<Map<String, Iterable<String>>> getAllClusterIdToFaceIDs();
  Future<Iterable<String>> getFaceIDsForCluster(String clusterID);
  Future<Map<String, Map<String, Set<String>>>> getPersonToClusterIdToFaceIds();
  Future<Map<String, Set<String>>> getClusterIdToFaceIdsForPerson(
    String personID,
  );
  Future<Set<String>> getFaceIDsForPerson(String personID);
  Future<Iterable<double>> getBlurValuesForCluster(String clusterID);
  Future<Map<String, String?>> getFaceIdsToClusterIds(Iterable<String> faceIds);
  Future<Map<int, Set<String>>> getFileIdToClusterIds();
  Future<void> forceUpdateClusterIds(Map<String, String> faceIDToClusterID);
  Future<void> removeFaceIdToClusterId(Map<String, String> faceIDToClusterID);
  Future<void> removePerson(String personID);
  Future<List<FaceDbInfoForClustering>> getFaceInfoForClustering({
    int maxFaces,
    int offset,
    int batchSize,
  });
  Future<Map<String, Uint8List>> getFaceEmbeddingMapForFaces(
    Iterable<String> faceIDs,
  );
  Future<int> getTotalFaceCount();
  Future<int> getErroredFaceCount();
  Future<Set<int>> getErroredFileIDs();
  Future<void> deleteFaceIndexForFiles(List<int> fileIDs);
  Future<int> getClusteredOrFacelessFileCount();
  Future<double> getClusteredToIndexableFilesRatio();
  Future<int> getUnclusteredFaceCount();
  Future<void> assignClusterToPerson({
    required String personID,
    required String clusterID,
  });
  Future<void> bulkAssignClusterToPersonID(
    Map<String, String> clusterToPersonID,
  );
  Future<void> captureNotPersonFeedback({
    required String personID,
    required String clusterID,
  });
  Future<void> bulkCaptureNotPersonFeedback(
    Map<String, String> clusterToPersonID,
  );
  Future<void> removeNotPersonFeedback({
    required String personID,
    required String clusterID,
  });
  Future<void> removeClusterToPerson({
    required String personID,
    required String clusterID,
  });
  Future<Map<int, Set<String>>> getFileIdToClusterIDSet(String personID);
  Future<Map<int, Set<String>>> getFileIdToClusterIDSetForCluster(
    Set<String> clusterIDs,
  );
  Future<void> clusterSummaryUpdate(Map<String, (Uint8List, int)> summary);
  Future<void> deleteClusterSummary(String clusterID);
  Future<Map<String, (Uint8List, int)>> getAllClusterSummary([
    int? minClusterSize,
  ]);
  Future<Map<String, (Uint8List, int)>> getClusterToClusterSummary(
    Iterable<String> clusterIDs,
  );
  Future<Map<String, String>> getClusterIDToPersonID();
  Future<void> dropClustersAndPersonTable({bool faces});
  Future<void> dropFacesFeedbackTables();
  Future<List<int>> getFileIDsOfPersonID(String personID);
  Future<List<int>> getFileIDsOfClusterID(String clusterID);
  Future<Set<int>> getAllFileIDsOfFaceIDsNotInAnyCluster();
  Future<Set<int>> getAllFilesAssociatedWithAllClusters({
    List<String>? exceptClusters,
  });

  Future<List<EmbeddingVector>> getAllClipVectors();
  Future<Map<int, int>> clipIndexedFileWithVersion();
  Future<int> getClipIndexedFileCount({int minimumMlVersion});
  Future<void> putClip(List<ClipEmbedding> embeddings);
  Future<void> deleteClipEmbeddings(List<int> fileIDs);
  Future<void> deleteClipIndexes();
}
